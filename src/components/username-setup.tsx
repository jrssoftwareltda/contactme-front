"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Logo } from "@/components/logo";

export function UsernameSetup() {
  const router = useRouter();
  const [username, setUsername] = useState("john");
  const [copied, setCopied] = useState(false);
  const valid = /^[a-z0-9][a-z0-9._-]{2,29}$/.test(username);
  const link = useMemo(() => `www.thecontact.me/${username || "username"}`, [username]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (valid) router.push("/app");
  }

  async function copy() {
    await navigator.clipboard?.writeText(`https://${link}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="onboarding-page">
      <header className="onboarding-header"><Logo /></header>
      <section className="onboarding-card">
        <div className="stepper" aria-label="Onboarding progress"><span className="active">1</span><i /><span>2</span></div>
        <div className="onboarding-icon">@</div>
        <h1>Choose your username</h1>
        <p>This becomes your public link so other people can start a conversation with you.</p>
        <form onSubmit={submit}>
          <label>Username
            <div className="availability-field">
              <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} placeholder="username" />
              {valid ? <span><Check size={16} /> Available</span> : <span className="invalid">Unavailable</span>}
            </div>
          </label>
          <div className="link-preview"><span>{link}</span><button type="button" onClick={copy} title="Copy link">{copied ? <Check size={18} /> : <Copy size={18} />}</button><ExternalLink size={17} /></div>
          <small className="field-help">Use 3–30 lowercase letters, numbers, dots, underscores or hyphens.</small>
          <div className="onboarding-actions"><button type="button" className="button button--outline" onClick={() => router.back()}>Back</button><button type="submit" disabled={!valid} className="button button--primary">Continue</button></div>
        </form>
      </section>
    </main>
  );
}
