"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, MoreVertical, Paperclip, Send, ShieldCheck, Smile, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { ConversationResponse, EncryptedMessageResponse, MessagePageResponse, TypingEvent } from "@/lib/backend-types";
import { decryptMessage, e2eeKeyVersion, encryptTextMessage, ensureConversationKey } from "@/lib/e2ee";
import { conversationLabel, conversationPeer, formatMessageTime, initials } from "@/lib/ui";
import type { ChatMessage } from "@/lib/types";
import { useContactMe } from "@/providers/contactme-provider";

export function ChatScreen({ conversationId }: { conversationId: string }) {
  const { request, getToken, profile, device, realtimeConnected, subscribe, publish } = useContactMe();
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimer = useRef<number | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const peer = useMemo(() => conversation ? conversationPeer(conversation, profile) : undefined, [conversation, profile]);
  const title = conversation ? conversationLabel(conversation, profile) : "Conversation";
  const hasPendingMember = conversation?.participants.some((participant) => participant.membershipStatus === "PENDING") ?? false;
  const currentPending = conversation?.membershipStatus === "PENDING";

  const decryptOne = useCallback(async (encrypted: EncryptedMessageResponse, sourceConversation: ConversationResponse): Promise<ChatMessage> => {
    if (!device) throw new Error("Encryption device is not ready.");
    const key = await ensureConversationKey(getToken, sourceConversation, device, encrypted.keyVersion, false);
    const decrypted = await decryptMessage(encrypted, key);
    return {
      id: encrypted.id,
      sender: encrypted.senderId === profile?.id ? "me" : "them",
      text: decrypted.text,
      time: formatMessageTime(encrypted.createdAt),
      failed: decrypted.decryptFailed,
    };
  }, [device, getToken, profile?.id]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const loadedConversation = await request<ConversationResponse>(`/conversations/${conversationId}`);
      setConversation(loadedConversation);
      const history = await request<MessagePageResponse>(`/conversations/${conversationId}/messages?limit=100`);
      if (device && history.items.length) {
        const decrypted = await Promise.all(history.items.map(async (message) => {
          try { return await decryptOne(message, loadedConversation); }
          catch { return { id: message.id, sender: message.senderId === profile?.id ? "me" : "them", text: "Encrypted message unavailable on this device.", time: formatMessageTime(message.createdAt), failed: true } as ChatMessage; }
        }));
        setMessages(decrypted.reverse());
      } else {
        setMessages([]);
        const pendingParticipant = loadedConversation.participants.some((participant) => participant.membershipStatus === "PENDING");
        if (device && loadedConversation.membershipStatus === "ACTIVE" && !pendingParticipant) {
          await ensureConversationKey(getToken, loadedConversation, device, e2eeKeyVersion, true).catch(() => undefined);
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load conversation.");
    } finally {
      setLoading(false);
    }
  }, [conversationId, decryptOne, device, getToken, profile?.id, request]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!realtimeConnected || !conversation) return;
    const messageSubscription = subscribe("/user/queue/messages", (frame) => {
      const encrypted = JSON.parse(frame.body) as EncryptedMessageResponse;
      if (encrypted.conversationId !== conversationId) return;
      void decryptOne(encrypted, conversation).then((message) => {
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
        if (encrypted.senderId !== profile?.id) publish("/app/receipts.update", { messageId: encrypted.id, status: "READ" });
      }).catch(() => undefined);
    });
    const typingSubscription = subscribe("/user/queue/typing", (frame) => {
      const event = JSON.parse(frame.body) as TypingEvent;
      if (event.conversationId === conversationId && event.userId !== profile?.id) setPeerTyping(event.typing);
    });
    return () => { messageSubscription?.unsubscribe(); typingSubscription?.unsubscribe(); };
  }, [conversation, conversationId, decryptOne, profile?.id, publish, realtimeConnected, subscribe]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, peerTyping]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || !conversation || !device || hasPendingMember || currentPending) return;
    setSending(true);
    setError("");
    setText("");
    try {
      const key = await ensureConversationKey(getToken, conversation, device, e2eeKeyVersion, messages.length === 0);
      const encrypted = await encryptTextMessage(value, key);
      const command = {
        conversationId,
        clientMessageId: crypto.randomUUID(),
        senderDeviceId: device.id,
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        algorithm: "AES-256-GCM",
        encryptionVersion: 1,
        keyVersion: e2eeKeyVersion,
      };
      const sentRealtime = publish("/app/messages.send", command);
      if (!sentRealtime) {
        const saved = await request<EncryptedMessageResponse>(`/conversations/${conversationId}/messages`, {
          method: "POST",
          body: JSON.stringify({ ...command, conversationId: undefined }),
        });
        const local = await decryptOne(saved, conversation);
        setMessages((current) => [...current, local]);
      }
    } catch (cause) {
      setText(value);
      setError(cause instanceof Error ? cause.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  function updateTyping(value: string) {
    setText(value);
    if (!conversation || hasPendingMember || currentPending) return;
    publish("/app/typing", { conversationId, typing: Boolean(value.trim()) });
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => publish("/app/typing", { conversationId, typing: false }), 900);
  }

  async function acceptRequest() {
    try {
      const accepted = await request<ConversationResponse>(`/conversations/${conversationId}/accept`, { method: "POST" });
      setConversation(accepted);
      if (device) await ensureConversationKey(getToken, accepted, device, e2eeKeyVersion, true).catch(() => undefined);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to accept conversation."); }
  }

  async function declineRequest() {
    try {
      await request<void>(`/conversations/${conversationId}/decline`, { method: "POST" });
      location.href = "/app/requests";
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to decline conversation."); }
  }

  return (
    <section className="chat-screen">
      <header className="chat-header">
        <Link href="/app" className="icon-button"><ArrowLeft size={21} /></Link>
        <Avatar initials={initials(title)} online={peer?.membershipStatus === "ACTIVE"} size="sm" />
        <div className="chat-header__person"><strong>{title}</strong><small>{peer?.username ? `@${peer.username}` : conversation?.type === "GROUP" ? "Group" : "Contact"}{realtimeConnected ? " · Secure realtime" : " · Reconnecting"}</small></div>
        <div className="chat-header__actions"><span className="e2ee-indicator" title="End-to-end encrypted"><ShieldCheck size={18} /></span><button className="icon-button"><MoreVertical size={19} /></button></div>
      </header>
      <div className="chat-thread" ref={threadRef}>
        {loading ? <div className="list-loading"><div className="app-spinner" /><span>Decrypting conversation…</span></div> : null}
        {error ? <div className="inline-alert inline-alert--error chat-error">{error}</div> : null}
        {!loading && currentPending ? <div className="request-banner"><div><strong>{title} wants to start a conversation.</strong><p>Accept to enable encrypted messaging.</p></div><div><button className="button button--primary button--sm" onClick={() => void acceptRequest()}><Check size={16} /> Accept</button><button className="button button--outline button--sm" onClick={() => void declineRequest()}><X size={16} /> Decline</button></div></div> : null}
        {!loading && hasPendingMember && !currentPending ? <div className="request-banner waiting"><div><strong>Conversation request sent</strong><p>You can start messaging after {title} accepts.</p></div></div> : null}
        {!loading && messages.length === 0 && !currentPending ? <div className="chat-empty"><ShieldCheck size={28} /><strong>End-to-end encrypted</strong><p>Messages are encrypted in your browser before being sent.</p></div> : null}
        {messages.map((message) => (
          <div key={message.id} className={`message-line ${message.sender === "me" ? "message-line--me" : ""}`}>
            <div className={`message-bubble ${message.sender === "me" ? "message-bubble--me" : ""} ${message.failed ? "message-bubble--failed" : ""}`}>
              <p>{message.text}</p>
              <time>{message.time}{message.sender === "me" ? " ✓✓" : ""}</time>
            </div>
          </div>
        ))}
        {peerTyping ? <div className="typing-indicator"><span /><span /><span /></div> : null}
      </div>
      <form className="chat-composer" onSubmit={send}>
        <button type="button" className="icon-button" disabled title="Encrypted attachments are planned next"><Paperclip size={20} /></button>
        <input value={text} onChange={(event) => updateTyping(event.target.value)} placeholder={hasPendingMember || currentPending ? "Messaging unlocks after acceptance" : "Type a message..."} aria-label="Message" disabled={loading || hasPendingMember || currentPending} />
        <button type="button" className="icon-button composer-smile"><Smile size={20} /></button>
        <button type="submit" className="send-button" aria-label="Send" disabled={sending || !text.trim() || hasPendingMember || currentPending}>{sending ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}</button>
      </form>
    </section>
  );
}
