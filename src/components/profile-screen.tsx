"use client";

import { useEffect, useState } from "react";
import { Camera, Check, ChevronRight, Copy, Share2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { initials } from "@/lib/ui";
import { useContactMe } from "@/providers/contactme-provider";

export function ProfileScreen() {
  const { profile, updateProfile } = useContactMe();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [statusText, setStatusText] = useState("Available");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(profile?.displayName || "");
    setStatusText(profile?.status === "BUSY" ? "Busy" : profile?.status === "AWAY" ? "Away" : profile?.status === "OFFLINE" ? "Offline" : "Available");
  }, [profile]);

  const link = profile?.contactUrl || `https://www.thecontact.me/${profile?.username || ""}`;

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateProfile({
        displayName: name,
        status: statusText.toUpperCase() as "AVAILABLE" | "AWAY" | "BUSY" | "OFFLINE",
      });
      setEditing(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update profile."); }
    finally { setSaving(false); }
  }

  async function copyLink() {
    await navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function shareLink() {
    if (navigator.share) await navigator.share({ title: "Contact me", url: link });
    else await copyLink();
  }

  return (
    <section className="screen profile-screen">
      <header className="screen-header mobile-app-header"><span className="header-spacer" /><h1>Profile</h1><span className="header-spacer" /></header>
      <div className="screen-content profile-content">
        <div className="desktop-screen-title"><div><h1>Profile</h1><p>Manage how people see and contact you.</p></div></div>
        {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
        <div className="profile-hero">
          <div className="profile-avatar-wrap"><Avatar initials={initials(profile?.displayName || profile?.username)} online={profile?.status === "AVAILABLE"} size="xl" /><button className="camera-button" title="Avatar is synchronized from Clerk for now"><Camera size={16} /></button></div>
          {editing ? (
            <div className="profile-edit-fields"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Display name" /><select value={statusText} onChange={(event) => setStatusText(event.target.value)}><option>Available</option><option>Away</option><option>Busy</option><option>Offline</option></select><button className="button button--primary button--sm" disabled={saving} onClick={() => void save()}><Check size={16} /> {saving ? "Saving…" : "Save"}</button></div>
          ) : (
            <><h2>{profile?.displayName || profile?.username}</h2><p>@{profile?.username}</p><button className="button button--outline button--sm" onClick={() => setEditing(true)}>Edit profile</button></>
          )}
        </div>
        <div className="profile-section">
          <div className="profile-section__title"><strong>My link</strong><button onClick={() => void shareLink()}><Share2 size={18} /></button></div>
          <button className="profile-link" onClick={() => void copyLink()}><span>{link.replace(/^https?:\/\//, "")}</span>{copied ? <Check size={18} /> : <Copy size={18} />}</button>
        </div>
        <div className="profile-menu">
          <button><div><strong>Status</strong><small>{statusText}</small></div><ChevronRight size={19} /></button>
          <a href="/app/settings"><div><strong>Settings</strong><small>Notifications, security and account</small></div><ChevronRight size={19} /></a>
          <a href="/app/settings#security"><div><strong>Devices</strong><small>Manage devices holding your encryption keys</small></div><ChevronRight size={19} /></a>
        </div>
      </div>
    </section>
  );
}
