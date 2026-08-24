"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Link2, LoaderCircle, Search, Share2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { ConversationResponse, PublicUserResponse } from "@/lib/backend-types";
import { initials, userLabel } from "@/lib/ui";
import { useContactMe } from "@/providers/contactme-provider";

export function NewConversationScreen() {
  const router = useRouter();
  const { request, profile } = useContactMe();
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<PublicUserResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) { setContacts([]); setSearching(false); return; }
    const timer = window.setTimeout(() => {
      setSearching(true);
      setError("");
      void request<PublicUserResponse[]>(`/users/search?q=${encodeURIComponent(normalized)}&limit=20`)
        .then(setContacts)
        .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to search users."))
        .finally(() => setSearching(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, request]);

  const inviteUrl = useMemo(() => profile?.contactUrl || (profile?.username ? `https://contactme.jrssoftware.com/${profile.username}` : "https://contactme.jrssoftware.com"), [profile]);

  async function startConversation(contact: PublicUserResponse) {
    if (!contact.username) return;
    setStarting(contact.id);
    setError("");
    try {
      const conversation = await request<ConversationResponse>("/conversations/direct", {
        method: "POST",
        body: JSON.stringify({ username: contact.username }),
      });
      router.push(`/app/chat/${conversation.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start conversation.");
    } finally {
      setStarting(null);
    }
  }

  async function shareLink() {
    if (navigator.share) await navigator.share({ title: "Contact me", url: inviteUrl });
    else await navigator.clipboard?.writeText(inviteUrl);
  }

  return (
    <section className="screen new-conversation-screen">
      <header className="screen-header mobile-app-header"><Link href="/app" className="icon-button"><ArrowLeft size={21} /></Link><h1>New conversation</h1><span className="header-spacer" /></header>
      <div className="screen-content narrow-screen-content">
        <div className="desktop-screen-title"><div><h1>New conversation</h1><p>Find someone by name or username.</p></div></div>
        <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or username" /></div>
        {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
        <div className="contact-list">
          {contacts.map((contact) => (
            <button type="button" onClick={() => void startConversation(contact)} key={contact.id} className="contact-row contact-row--button" disabled={starting === contact.id}>
              <Avatar initials={initials(userLabel(contact))} online={contact.status === "AVAILABLE"} />
              <div><strong>{userLabel(contact)}</strong><small>@{contact.username}</small></div>
              {starting === contact.id ? <LoaderCircle className="spin" size={18} /> : null}
            </button>
          ))}
          {searching ? <div className="list-loading compact"><div className="app-spinner" /><span>Searching…</span></div> : null}
          {!searching && query.trim().length >= 2 && contacts.length === 0 ? <div className="empty-state compact"><p>No users found.</p></div> : null}
          {query.trim().length < 2 ? <div className="empty-state compact"><p>Type at least 2 characters to search Contact Me users.</p></div> : null}
        </div>
        <button className="share-link-card" onClick={() => void shareLink()}><span><Link2 size={20} /></span><div><strong>Invite by link</strong><small>{inviteUrl.replace(/^https?:\/\//, "")}</small></div><Share2 size={19} /></button>
      </div>
    </section>
  );
}
