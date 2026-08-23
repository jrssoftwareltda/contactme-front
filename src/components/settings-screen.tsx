"use client";

import { useState } from "react";
import { Bell, Globe2, LockKeyhole, MessageSquareText, Moon, ShieldCheck } from "lucide-react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" className={`toggle ${checked ? "toggle--on" : ""}`} onClick={() => onChange(!checked)} aria-pressed={checked}><span /></button>;
}

export function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [dark, setDark] = useState(false);
  const [allowGuests, setAllowGuests] = useState(true);

  return (
    <section className="screen settings-screen">
      <header className="screen-header mobile-app-header"><span className="header-spacer" /><h1>Settings</h1><span className="header-spacer" /></header>
      <div className="screen-content settings-content">
        <div className="desktop-screen-title"><div><h1>Settings</h1><p>Configure your Contact Me experience.</p></div></div>
        <div className="settings-group">
          <h2>Experience</h2>
          <div className="setting-row"><span className="setting-icon"><Bell size={19} /></span><div><strong>Notifications</strong><small>Receive browser notifications for new messages</small></div><Toggle checked={notifications} onChange={setNotifications} /></div>
          <div className="setting-row"><span className="setting-icon"><MessageSquareText size={19} /></span><div><strong>Message sounds</strong><small>Play a sound for incoming messages</small></div><Toggle checked={sounds} onChange={setSounds} /></div>
          <div className="setting-row"><span className="setting-icon"><Moon size={19} /></span><div><strong>Dark mode</strong><small>Dark appearance will be added in a future iteration</small></div><Toggle checked={dark} onChange={setDark} /></div>
        </div>
        <div className="settings-group" id="privacy">
          <h2>Privacy</h2>
          <div className="setting-row"><span className="setting-icon"><Globe2 size={19} /></span><div><strong>Allow guest conversations</strong><small>People can open your link and start a chat without creating an account</small></div><Toggle checked={allowGuests} onChange={setAllowGuests} /></div>
          <div className="setting-row setting-row--static"><span className="setting-icon"><ShieldCheck size={19} /></span><div><strong>Profile visibility</strong><small>Public through your Contact Me link</small></div><span className="setting-value">Public</span></div>
          <div className="setting-row setting-row--static"><span className="setting-icon"><LockKeyhole size={19} /></span><div><strong>Blocked contacts</strong><small>Manage people you have blocked</small></div><span className="setting-value">0</span></div>
        </div>
      </div>
    </section>
  );
}
