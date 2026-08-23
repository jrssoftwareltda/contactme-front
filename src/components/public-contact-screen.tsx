"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Logo } from "@/components/logo";
import { publicContactMeRequest } from "@/lib/api";
import type { ConversationResponse, PublicUserResponse } from "@/lib/backend-types";
import { initials, userLabel } from "@/lib/ui";
import { useContactMe } from "@/providers/contactme-provider";

export function PublicContactScreen({ username }: { username: string }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { request, profile } = useContactMe();
  const [user, setUser] = useState<PublicUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void publicContactMeRequest<PublicUserResponse>(`/public/users/${encodeURIComponent(username)}`)
      .then(setUser)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Contact not found."))
      .finally(() => setLoading(false));
  }, [username]);

  async function start() {
    if (!user?.username || !isLoaded) return;
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/${user.username}`)}`);
      return;
    }
    if (!profile?.username) {
      router.push("/onboarding/username");
      return;
    }
    if (profile.username === user.username) {
      router.push("/app");
      return;
    }
    setStarting(true);
    setError("");
    try {
      const conversation = await request<ConversationResponse>("/conversations/direct", { method: "POST", body: JSON.stringify({ username: user.username }) });
      router.push(`/app/chat/${conversation.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to start conversation."); }
    finally { setStarting(false); }
  }

  return <main className="public-contact-page"><section className="public-contact-card">
    <Logo href="/" />
    {loading ? <div className="list-loading"><div className="app-spinner" /><span>Loading contact…</span></div> : null}
    {!loading && user ? <>
      <Avatar initials={initials(userLabel(user))} online={user.status === "AVAILABLE"} size="xl" />
      <h1>{userLabel(user)}</h1><p>@{user.username}</p>
      <button className="button button--primary button--lg" onClick={() => void start()} disabled={starting}><MessageCircle size={19} /> {starting ? "Starting…" : profile?.username === user.username ? "Open my conversations" : "Start conversation"}</button>
      <div className="public-contact-security"><ShieldCheck size={16} /> Messages are end-to-end encrypted after the conversation is accepted.</div>
    </> : null}
    {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
  </section></main>;
}
