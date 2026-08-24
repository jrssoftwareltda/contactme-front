export type TokenGetter = () => Promise<string | null>;

const API_URL = (process.env.NEXT_PUBLIC_CONTACTME_API_URL || "https://apicontactme.jrssoftware.com").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function messageFromPayload(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const object = payload as Record<string, unknown>;
    const candidate = object.message ?? object.detail ?? object.error;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return fallback;
}

export async function contactMeRequest<T>(
  getToken: TokenGetter,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  if (!token) throw new ApiError(401, "You must be signed in.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(response.status, messageFromPayload(payload, `Request failed (${response.status}).`), payload);
  }
  return payload as T;
}

export async function publicContactMeRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}/api/v1${path}`, { cache: "no-store" });
  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(response.status, messageFromPayload(payload, `Request failed (${response.status}).`), payload);
  }
  return payload as T;
}

export const contactMeApiUrl = API_URL;
export const contactMeWsUrl = process.env.NEXT_PUBLIC_CONTACTME_WS_URL || "wss://apicontactme.jrssoftware.com/ws";
