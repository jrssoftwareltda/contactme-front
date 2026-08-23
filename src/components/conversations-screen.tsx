"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Menu, Plus, Search, SquarePen } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { mockConversations } from "@/lib/mock-data";

export function ConversationsScreen() {
  const [query, setQuery] = useState("");
  const conversations = useMemo(() => mockConversations.filter((c) => `${c.name} ${c.preview}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <section className="screen conversation-screen">
      <header className="screen-header mobile-app-header"><button className="icon-button" aria-label="Menu"><Menu size={21} /></button><h1>Conversations</h1><Link href="/app/new" className="icon-button"><SquarePen size={20} /></Link></header>
      <div className="screen-content">
        <div className="desktop-screen-title"><div><h1>Conversations</h1><p>Pick up where you left off.</p></div><Link href="/app/new" className="button button--primary"><Plus size={18} /> New conversation</Link></div>
        <div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" /></div>
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <Link key={conversation.id} href={`/app/chat/${conversation.id}`} className="conversation-row">
              <Avatar initials={conversation.initials} online={conversation.status === "online"} />
              <div className="conversation-row__body"><div><strong>{conversation.name}</strong><time>{conversation.time}</time></div><div><p>{conversation.preview}</p>{conversation.unread ? <span className="unread-badge">{conversation.unread}</span> : null}</div></div>
            </Link>
          ))}
          {conversations.length === 0 ? <div className="empty-state"><MessageFallback /><h3>No conversations found</h3><p>Try a different search.</p></div> : null}
        </div>
      </div>
    </section>
  );
}

function MessageFallback() {
  return <span className="empty-icon">💬</span>;
}
