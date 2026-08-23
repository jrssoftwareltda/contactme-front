"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Menu, Plus, Search, SquarePen } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { ConversationFilter, ConversationResponse, EncryptedMessageResponse, PageResponse } from "@/lib/backend-types";
import { decryptMessage, ensureConversationKey } from "@/lib/e2ee";
import { conversationLabel, conversationPeer, formatConversationTime, initials } from "@/lib/ui";
import { useContactMe } from "@/providers/contactme-provider";

export function ConversationsScreen({
  filter = "ALL",
  title = "Conversations",
  description = "Pick up where you left off.",
}: {
  filter?: ConversationFilter;
  title?: string;
  description?: string;
}) {
  const { request, getToken, profile, device, subscribe, realtimeConnected } = useContactMe();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ConversationResponse[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await request<PageResponse<ConversationResponse>>(`/conversations?filter=${filter}&page=0&size=50`);
      setItems(page.items);
      if (device) {
        const decrypted = await Promise.all(page.items.map(async (conversation) => {
          if (!conversation.lastMessage) return [conversation.id, "No messages yet"] as const;
          try {
            const key = await ensureConversationKey(getToken, conversation, device, conversation.lastMessage.keyVersion, false);
            const message = await decryptMessage(conversation.lastMessage, key);
            return [conversation.id, message.text] as const;
          } catch {
            return [conversation.id, "Encrypted message"] as const;
          }
        }));
        setPreviews(Object.fromEntries(decrypted));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load conversations.");
    } finally {
      setLoading(false);
    }
  }, [device, filter, getToken, request]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!realtimeConnected) return;
    const subscription = subscribe("/user/queue/messages", (frame) => {
      const message = JSON.parse(frame.body) as EncryptedMessageResponse;
      setItems((current) => current.some((item) => item.id === message.conversationId) ? current : current);
      void load();
    });
    return () => subscription?.unsubscribe();
  }, [load, realtimeConnected, subscribe]);

  const conversations = useMemo(() => items.filter((conversation) => {
    const name = conversationLabel(conversation, profile);
    const preview = previews[conversation.id] || "";
    return `${name} ${preview}`.toLowerCase().includes(query.toLowerCase());
  }), [items, previews, profile, query]);

  return (
    <section className="screen conversation-screen">
      <header className="screen-header mobile-app-header"><button className="icon-button" aria-label="Menu"><Menu size={21} /></button><h1>{title}</h1><Link href="/app/new" className="icon-button"><SquarePen size={20} /></Link></header>
      <div className="screen-content">
        <div className="desktop-screen-title"><div><h1>{title}</h1><p>{description}</p></div><Link href="/app/new" className="button button--primary"><Plus size={18} /> New conversation</Link></div>
        <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" /></div>
        {error ? <div className="inline-alert inline-alert--error">{error}<button onClick={() => void load()}>Retry</button></div> : null}
        {loading ? <div className="list-loading"><div className="app-spinner" /><span>Loading conversations…</span></div> : null}
        {!loading ? <div className="conversation-list">
          {conversations.map((conversation) => {
            const peer = conversationPeer(conversation, profile);
            const name = conversationLabel(conversation, profile);
            const handle = peer?.username || (conversation.type === "GROUP" ? "group" : "contact");
            return (
              <Link key={conversation.id} href={`/app/chat/${conversation.id}`} className="conversation-row">
                <Avatar initials={initials(name)} online={peer?.membershipStatus === "ACTIVE"} />
                <div className="conversation-row__body"><div><strong>{name}</strong><time>{formatConversationTime(conversation.updatedAt)}</time></div><div><p>{previews[conversation.id] || (conversation.lastMessage ? "Encrypted message" : `@${handle}`)}</p>{conversation.unreadCount ? <span className="unread-badge">{conversation.unreadCount}</span> : null}</div></div>
              </Link>
            );
          })}
          {conversations.length === 0 ? <div className="empty-state"><span className="empty-icon">💬</span><h3>No conversations found</h3><p>{query ? "Try a different search." : "Start a new conversation to see it here."}</p></div> : null}
        </div> : null}
      </div>
    </section>
  );
}
