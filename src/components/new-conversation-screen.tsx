"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Link2, Search, Share2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { mockContacts } from "@/lib/mock-data";

export function NewConversationScreen() {
  const [query, setQuery] = useState("");
  const contacts = useMemo(() => mockContacts.filter((c) => `${c.name} ${c.username}`.toLowerCase().includes(query.toLowerCase())), [query]);

  async function shareLink() {
    const url = "https://www.thecontact.me/john";
    if (navigator.share) await navigator.share({ title: "Contact me", url });
    else await navigator.clipboard?.writeText(url);
  }

  return (
    <section className="screen new-conversation-screen">
      <header className="screen-header mobile-app-header"><Link href="/app" className="icon-button"><ArrowLeft size={21} /></Link><h1>New conversation</h1><span className="header-spacer" /></header>
      <div className="screen-content narrow-screen-content">
        <div className="desktop-screen-title"><div><h1>New conversation</h1><p>Find someone by name or username.</p></div></div>
        <div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or username" /></div>
        <div className="contact-list">
          {contacts.map((contact) => (
            <Link href={`/app/chat/${contact.id}`} key={contact.id} className="contact-row">
              <Avatar initials={contact.initials} online={contact.status === "online"} />
              <div><strong>{contact.name}</strong><small>@{contact.username}</small></div>
            </Link>
          ))}
        </div>
        <button className="share-link-card" onClick={shareLink}><span><Link2 size={20} /></span><div><strong>Invite by link</strong><small>Share your Contact Me link</small></div><Share2 size={19} /></button>
      </div>
    </section>
  );
}
