"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MoreVertical, Paperclip, Phone, Send, Smile } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { mockContacts, mockMessages } from "@/lib/mock-data";
import type { ChatMessage } from "@/lib/types";

export function ChatScreen({ conversationId }: { conversationId: string }) {
  const contact = useMemo(() => mockContacts.find((c) => c.id === conversationId) ?? { id: conversationId, name: "Contact", username: conversationId, initials: "CM", status: "online" as const }, [conversationId]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages[conversationId] ?? [
    { id: "welcome", sender: "them", text: `Hi! This is ${contact.name}.`, time: "Now" },
  ]);
  const [text, setText] = useState("");

  function send(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    setMessages((items) => [...items, { id: crypto.randomUUID(), sender: "me", text: value, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setText("");
  }

  return (
    <section className="chat-screen">
      <header className="chat-header">
        <Link href="/app" className="icon-button"><ArrowLeft size={21} /></Link>
        <Avatar initials={contact.initials} online={contact.status === "online"} size="sm" />
        <div className="chat-header__person"><strong>{contact.name}</strong><small>@{contact.username}{contact.status === "online" ? " · Online" : ""}</small></div>
        <div className="chat-header__actions"><button className="icon-button"><Phone size={19} /></button><button className="icon-button"><MoreVertical size={19} /></button></div>
      </header>
      <div className="chat-thread">
        <div className="chat-day">Today</div>
        {messages.map((message) => (
          <div key={message.id} className={`message-line ${message.sender === "me" ? "message-line--me" : ""}`}>
            <div className={`message-bubble ${message.sender === "me" ? "message-bubble--me" : ""}`}>
              {message.attachment ? <div className="attachment-card"><span>PDF</span><div><strong>{message.attachment.name}</strong><small>{message.attachment.size}</small></div></div> : <p>{message.text}</p>}
              <time>{message.time}{message.sender === "me" ? " ✓✓" : ""}</time>
            </div>
          </div>
        ))}
      </div>
      <form className="chat-composer" onSubmit={send}>
        <button type="button" className="icon-button"><Paperclip size={20} /></button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." aria-label="Message" />
        <button type="button" className="icon-button composer-smile"><Smile size={20} /></button>
        <button type="submit" className="send-button" aria-label="Send"><Send size={18} /></button>
      </form>
    </section>
  );
}
