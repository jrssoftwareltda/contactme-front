"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Globe2, Laptop, LockKeyhole, MessageSquareText, Moon, ShieldCheck, Trash2 } from "lucide-react";
import type { DeviceResponse } from "@/lib/backend-types";
import { useContactMe } from "@/providers/contactme-provider";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" className={`toggle ${checked ? "toggle--on" : ""}`} onClick={() => onChange(!checked)} aria-pressed={checked}><span /></button>;
}

export function SettingsScreen() {
  const { request, device, realtimeConnected } = useContactMe();
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [dark, setDark] = useState(false);
  const [allowGuests, setAllowGuests] = useState(false);
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [error, setError] = useState("");

  const loadDevices = useCallback(async () => {
    try { setDevices(await request<DeviceResponse[]>("/devices")); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load devices."); }
  }, [request]);

  useEffect(() => { void loadDevices(); }, [loadDevices]);

  async function revoke(deviceId: string) {
    if (deviceId === device?.id && !window.confirm("Revoke this browser? You may lose access to conversation keys that were only available on this device.")) return;
    try {
      await request<void>(`/devices/${deviceId}`, { method: "DELETE" });
      await loadDevices();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to revoke device."); }
  }

  return (
    <section className="screen settings-screen">
      <header className="screen-header mobile-app-header"><span className="header-spacer" /><h1>Settings</h1><span className="header-spacer" /></header>
      <div className="screen-content settings-content">
        <div className="desktop-screen-title"><div><h1>Settings</h1><p>Configure your Contact Me experience.</p></div></div>
        {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
        <div className="settings-group">
          <h2>Experience</h2>
          <div className="setting-row"><span className="setting-icon"><Bell size={19} /></span><div><strong>Notifications</strong><small>Browser notification UI preference (push delivery comes next)</small></div><Toggle checked={notifications} onChange={setNotifications} /></div>
          <div className="setting-row"><span className="setting-icon"><MessageSquareText size={19} /></span><div><strong>Message sounds</strong><small>Play a sound for incoming messages</small></div><Toggle checked={sounds} onChange={setSounds} /></div>
          <div className="setting-row"><span className="setting-icon"><Moon size={19} /></span><div><strong>Dark mode</strong><small>Dark appearance will be added in a future iteration</small></div><Toggle checked={dark} onChange={setDark} /></div>
        </div>
        <div className="settings-group" id="privacy">
          <h2>Privacy</h2>
          <div className="setting-row"><span className="setting-icon"><Globe2 size={19} /></span><div><strong>Allow guest conversations</strong><small>Reserved for the future guest messaging backend flow</small></div><Toggle checked={allowGuests} onChange={setAllowGuests} /></div>
          <div className="setting-row setting-row--static"><span className="setting-icon"><ShieldCheck size={19} /></span><div><strong>Profile visibility</strong><small>Public through your Contact Me link</small></div><span className="setting-value">Public</span></div>
          <div className="setting-row setting-row--static"><span className="setting-icon"><LockKeyhole size={19} /></span><div><strong>End-to-end encryption</strong><small>Private keys stay in this browser; the server stores ciphertext only</small></div><span className="setting-value">Enabled</span></div>
        </div>
        <div className="settings-group" id="security">
          <h2>Devices & encryption keys</h2>
          <div className="setting-row setting-row--static"><span className="setting-icon"><ShieldCheck size={19} /></span><div><strong>Realtime connection</strong><small>Authenticated STOMP over WebSocket</small></div><span className={`connection-pill ${realtimeConnected ? "online" : "offline"}`}>{realtimeConnected ? "Connected" : "Reconnecting"}</span></div>
          {devices.map((item) => <div className="setting-row device-row" key={item.id}>
            <span className="setting-icon"><Laptop size={19} /></span>
            <div><strong>{item.displayName || "Web browser"}{item.id === device?.id ? " · This device" : ""}</strong><small>{item.publicKeyAlgorithm} · last seen {new Date(item.lastSeenAt).toLocaleString()}</small></div>
            <button className="icon-button danger-button" onClick={() => void revoke(item.id)} title="Revoke device"><Trash2 size={17} /></button>
          </div>)}
        </div>
      </div>
    </section>
  );
}
