"use client";

import { useState } from "react";
import { Camera, Check, ChevronRight, Copy, Share2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { currentUser } from "@/lib/mock-data";

export function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [status, setStatus] = useState(currentUser.status);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard?.writeText(`https://${currentUser.link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function shareLink() {
    const url = `https://${currentUser.link}`;
    if (navigator.share) await navigator.share({ title: "Contact me", url });
    else copyLink();
  }

  return (
    <section className="screen profile-screen">
      <header className="screen-header mobile-app-header"><span className="header-spacer" /><h1>Profile</h1><span className="header-spacer" /></header>
      <div className="screen-content profile-content">
        <div className="desktop-screen-title"><div><h1>Profile</h1><p>Manage how people see and contact you.</p></div></div>
        <div className="profile-hero">
          <div className="profile-avatar-wrap"><Avatar initials={currentUser.initials} online size="xl" /><button className="camera-button"><Camera size={16} /></button></div>
          {editing ? (
            <div className="profile-edit-fields"><input value={name} onChange={(e) => setName(e.target.value)} /><input value={status} onChange={(e) => setStatus(e.target.value)} /><button className="button button--primary button--sm" onClick={() => setEditing(false)}><Check size={16} /> Save</button></div>
          ) : (
            <><h2>{name}</h2><p>@{currentUser.username}</p><button className="button button--outline button--sm" onClick={() => setEditing(true)}>Edit profile</button></>
          )}
        </div>
        <div className="profile-section">
          <div className="profile-section__title"><strong>My link</strong><button onClick={shareLink}><Share2 size={18} /></button></div>
          <button className="profile-link" onClick={copyLink}><span>{currentUser.link}</span>{copied ? <Check size={18} /> : <Copy size={18} />}</button>
        </div>
        <div className="profile-menu">
          <button><div><strong>Status</strong><small>{status}</small></div><ChevronRight size={19} /></button>
          <a href="/app/settings"><div><strong>Settings</strong><small>Notifications, appearance and account</small></div><ChevronRight size={19} /></a>
          <a href="/app/settings#privacy"><div><strong>Privacy</strong><small>Control who can reach you</small></div><ChevronRight size={19} /></a>
        </div>
      </div>
    </section>
  );
}
