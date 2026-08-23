"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import type { ConversationResponse } from "@/lib/backend-types";
import { ensureConversationKey } from "@/lib/e2ee";
import { conversationLabel, initials } from "@/lib/ui";
import { useContactMe } from "@/providers/contactme-provider";

export function RequestsScreen() {
  const router = useRouter();
  const { request, profile, device, getToken } = useContactMe();
  const [items, setItems] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await request<ConversationResponse[]>("/conversations/requests?limit=50")); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load requests."); }
    finally { setLoading(false); }
  }, [request]);

  useEffect(() => { void load(); }, [load]);

  async function accept(conversation: ConversationResponse) {
    try {
      const accepted = await request<ConversationResponse>(`/conversations/${conversation.id}/accept`, { method: "POST" });
      if (device) await ensureConversationKey(getToken, accepted, device, 1, true).catch(() => undefined);
      router.push(`/app/chat/${conversation.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to accept request."); }
  }

  async function decline(conversationId: string) {
    try {
      await request<void>(`/conversations/${conversationId}/decline`, { method: "POST" });
      setItems((current) => current.filter((item) => item.id !== conversationId));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to decline request."); }
  }

  return <section className="screen conversation-screen">
    <header className="screen-header mobile-app-header"><span className="header-spacer" /><h1>Requests</h1><span className="header-spacer" /></header>
    <div className="screen-content">
      <div className="desktop-screen-title"><div><h1>Requests</h1><p>People who want to start a conversation with you.</p></div></div>
      {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
      {loading ? <div className="list-loading"><div className="app-spinner" /><span>Loading requests…</span></div> : null}
      {!loading ? <div className="conversation-list request-list">
        {items.map((conversation) => {
          const name = conversationLabel(conversation, profile);
          return <div className="conversation-row request-row" key={conversation.id}>
            <Avatar initials={initials(name)} />
            <div className="conversation-row__body"><div><strong>{name}</strong></div><div><p>Wants to start a private conversation.</p></div></div>
            <div className="request-actions"><button className="icon-button request-accept" onClick={() => void accept(conversation)} aria-label="Accept"><Check size={18} /></button><button className="icon-button request-decline" onClick={() => void decline(conversation.id)} aria-label="Decline"><X size={18} /></button></div>
          </div>;
        })}
        {items.length === 0 ? <div className="empty-state"><span className="empty-icon">👋</span><h3>No pending requests</h3><p>New conversation requests will appear here.</p></div> : null}
      </div> : null}
    </div>
  </section>;
}
