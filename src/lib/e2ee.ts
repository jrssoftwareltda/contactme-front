import { ApiError, type TokenGetter, contactMeRequest } from "@/lib/api";
import type {
  ConversationKeyEnvelopeResponse,
  ConversationResponse,
  EncryptedMessageResponse,
  PublicDeviceKeyResponse,
} from "@/lib/backend-types";

const DB_NAME = "contactme-e2ee";
const DB_VERSION = 1;
const KEY_STORE = "keys";
const DEVICE_IDENTIFIER_KEY = "contactme.device.identifier";
const KEY_REVISION = 1;
const KEY_VERSION = 1;

export type LocalDevice = {
  id: string;
  deviceIdentifier: string;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicKeySerialized: string;
};

export type DecryptedMessage = EncryptedMessageResponse & {
  text: string;
  decryptFailed?: boolean;
};

type DeviceKeyRecord = {
  id: "device-keypair";
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicKeySerialized: string;
};

type ConversationKeyRecord = {
  id: string;
  key: CryptoKey;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KEY_STORE)) db.createObjectStore(KEY_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet<T>(id: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEY_STORE, "readonly");
    const request = tx.objectStore(KEY_STORE).get(id);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function idbPut(value: object): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEY_STORE, "readwrite");
    tx.objectStore(KEY_STORE).put(value);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

function bytesToBase64(bytes: ArrayBuffer | Uint8Array): string {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let index = 0; index < array.length; index += 1) binary += String.fromCharCode(array[index]);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function loadOrCreateDeviceKeyPair(): Promise<DeviceKeyRecord> {
  const existing = await idbGet<DeviceKeyRecord>("device-keypair");
  if (existing?.privateKey && existing?.publicKey) return existing;

  const pair = await crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"],
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const record: DeviceKeyRecord = {
    id: "device-keypair",
    privateKey: pair.privateKey,
    publicKey: pair.publicKey,
    publicKeySerialized: JSON.stringify(publicJwk),
  };
  await idbPut(record);
  return record;
}

function loadOrCreateDeviceIdentifier(): string {
  const existing = localStorage.getItem(DEVICE_IDENTIFIER_KEY);
  if (existing) return existing;
  const created = `web-${crypto.randomUUID()}`;
  localStorage.setItem(DEVICE_IDENTIFIER_KEY, created);
  return created;
}

function deviceDisplayName(): string {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || navigator.platform || "Web";
  const browser = navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Edg/") ? "Edge" : navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Safari") ? "Safari" : "Browser";
  return `${browser} on ${platform}`.slice(0, 160);
}

export async function bootstrapLocalDevice(getToken: TokenGetter): Promise<LocalDevice> {
  const keys = await loadOrCreateDeviceKeyPair();
  const deviceIdentifier = loadOrCreateDeviceIdentifier();
  const registered = await contactMeRequest<{ id: string }>(getToken, "/devices", {
    method: "POST",
    body: JSON.stringify({
      deviceIdentifier,
      displayName: deviceDisplayName(),
      publicKey: keys.publicKeySerialized,
      publicKeyAlgorithm: "RSA-OAEP-256",
      keyRevision: KEY_REVISION,
    }),
  });
  return { id: registered.id, deviceIdentifier, privateKey: keys.privateKey, publicKey: keys.publicKey, publicKeySerialized: keys.publicKeySerialized };
}

function conversationCacheId(conversationId: string, keyVersion = KEY_VERSION): string {
  return `conversation:${conversationId}:v${keyVersion}`;
}

async function cacheConversationKey(conversationId: string, key: CryptoKey, keyVersion = KEY_VERSION): Promise<void> {
  const record: ConversationKeyRecord = { id: conversationCacheId(conversationId, keyVersion), key };
  await idbPut(record);
}

async function cachedConversationKey(conversationId: string, keyVersion = KEY_VERSION): Promise<CryptoKey | null> {
  const record = await idbGet<ConversationKeyRecord>(conversationCacheId(conversationId, keyVersion));
  return record?.key ?? null;
}

async function importPublicKey(serialized: string): Promise<CryptoKey> {
  const jwk = JSON.parse(serialized) as JsonWebKey;
  return crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
}

async function decryptEnvelope(envelope: ConversationKeyEnvelopeResponse, privateKey: CryptoKey): Promise<CryptoKey> {
  const raw = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, base64ToBytes(envelope.encryptedConversationKey));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function allParticipantDeviceKeys(
  getToken: TokenGetter,
  conversation: ConversationResponse,
): Promise<PublicDeviceKeyResponse[]> {
  const usernames = [...new Set(conversation.participants.map((participant) => participant.username).filter((value): value is string => Boolean(value)))];
  const result = await Promise.all(
    usernames.map((username) => contactMeRequest<PublicDeviceKeyResponse[]>(getToken, `/users/${encodeURIComponent(username)}/devices/public-keys`)),
  );
  return result.flat();
}

export async function createAndDistributeConversationKey(
  getToken: TokenGetter,
  conversation: ConversationResponse,
): Promise<CryptoKey> {
  const generated = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const raw = await crypto.subtle.exportKey("raw", generated);
  const devices = await allParticipantDeviceKeys(getToken, conversation);
  if (devices.length === 0) throw new Error("No active participant devices are available for encrypted messaging.");

  const envelopes = await Promise.all(devices.map(async (device) => {
    const publicKey = await importPublicKey(device.publicKey);
    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, raw);
    return {
      deviceId: device.deviceId,
      keyVersion: KEY_VERSION,
      encryptedConversationKey: bytesToBase64(encrypted),
      algorithm: "RSA-OAEP-256",
    };
  }));

  await contactMeRequest<void>(getToken, `/conversations/${conversation.id}/keys`, {
    method: "PUT",
    body: JSON.stringify({ envelopes }),
  });
  await cacheConversationKey(conversation.id, generated, KEY_VERSION);
  return generated;
}

export async function ensureConversationKey(
  getToken: TokenGetter,
  conversation: ConversationResponse,
  device: LocalDevice,
  keyVersion = KEY_VERSION,
  allowCreate = true,
): Promise<CryptoKey> {
  const cached = await cachedConversationKey(conversation.id, keyVersion);
  if (cached) return cached;

  try {
    const envelope = await contactMeRequest<ConversationKeyEnvelopeResponse>(
      getToken,
      `/conversations/${conversation.id}/keys/device/${device.id}?keyVersion=${keyVersion}`,
    );
    const key = await decryptEnvelope(envelope, device.privateKey);
    await cacheConversationKey(conversation.id, key, keyVersion);
    return key;
  } catch (error) {
    if (allowCreate && error instanceof ApiError && error.status === 404 && conversation.membershipStatus === "ACTIVE") {
      return createAndDistributeConversationKey(getToken, conversation);
    }
    throw error;
  }
}

export async function encryptTextMessage(text: string, key: CryptoKey): Promise<{ ciphertext: string; nonce: string }> {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const payload = new TextEncoder().encode(JSON.stringify({ type: "text", text }));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, payload);
  return { ciphertext: bytesToBase64(encrypted), nonce: bytesToBase64(nonce) };
}

export async function decryptMessage(message: EncryptedMessageResponse, key: CryptoKey): Promise<DecryptedMessage> {
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(message.nonce) },
      key,
      base64ToBytes(message.ciphertext),
    );
    const parsed = JSON.parse(new TextDecoder().decode(decrypted)) as { type?: string; text?: string };
    return { ...message, text: parsed.text ?? "Unsupported encrypted message" };
  } catch {
    return { ...message, text: "Unable to decrypt this message on this device.", decryptFailed: true };
  }
}

export const e2eeKeyVersion = KEY_VERSION;
