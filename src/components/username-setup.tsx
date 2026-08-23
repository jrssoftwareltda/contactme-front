"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, LoaderCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import type { UsernameAvailabilityResponse } from "@/lib/backend-types";
import { useContactMe } from "@/providers/contactme-provider";

export function UsernameSetup() {
  const router = useRouter();
  const { profile, loading: backendLoading, request, updateProfile } = useContactMe();
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const validFormat = /^[a-z0-9][a-z0-9._-]{2,29}$/.test(username);
  const link = useMemo(() => `www.thecontact.me/${username || "username"}`, [username]);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile?.username]);

  useEffect(() => {
    if (!validFormat) { setAvailable(null); setChecking(false); return; }
    const timer = window.setTimeout(() => {
      setChecking(true);
      setError("");
      void request<UsernameAvailabilityResponse>(`/users/username-availability?username=${encodeURIComponent(username)}`)
        .then((response) => setAvailable(response.available))
        .catch((cause) => { setAvailable(false); setError(cause instanceof Error ? cause.message : "Unable to check username."); })
        .finally(() => setChecking(false));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [request, username, validFormat]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validFormat || !available) return;
    setSaving(true);
    setError("");
    try {
      await updateProfile({ username });
      router.replace("/app");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save username.");
    } finally {
      setSaving(false);
    }
  }

  async function copy() {
    await navigator.clipboard?.writeText(`https://${link}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (backendLoading) return <main className="app-gate"><div className="app-spinner" /><p>Preparing your secure profile…</p></main>;

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
              <input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/\s/g, ""))} placeholder="username" autoFocus />
              {checking ? <span><LoaderCircle className="spin" size={16} /> Checking</span> : validFormat && available ? <span><Check size={16} /> Available</span> : validFormat && available === false ? <span className="invalid">Unavailable</span> : null}
            </div>
          </label>
          <div className="link-preview"><span>{link}</span><button type="button" onClick={() => void copy()} title="Copy link">{copied ? <Check size={18} /> : <Copy size={18} />}</button><ExternalLink size={17} /></div>
          <small className="field-help">Use 3–30 lowercase letters, numbers, dots, underscores or hyphens.</small>
          {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
          <div className="onboarding-actions"><button type="button" className="button button--outline" onClick={() => router.back()}>Back</button><button type="submit" disabled={!validFormat || !available || checking || saving} className="button button--primary">{saving ? "Saving…" : "Continue"}</button></div>
        </form>
      </section>
    </main>
  );
}
