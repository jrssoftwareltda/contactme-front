"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { Link2, LockKeyhole, MessageCircle } from "lucide-react";
import { Logo } from "@/components/logo";

export function AuthForm({ mode }: { mode: "sign-up" | "sign-in" }) {
  const isSignUp = mode === "sign-up";
  const appearance = {
    elements: {
      rootBox: "clerk-root",
      cardBox: "clerk-card-box",
      card: "clerk-card",
      headerTitle: "clerk-title",
      headerSubtitle: "clerk-subtitle",
      footer: "clerk-footer",
    },
  } as const;

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Logo />
        <p>{isSignUp ? "Already have an account?" : "New to Contact Me?"} <Link href={isSignUp ? "/sign-in" : "/sign-up"}>{isSignUp ? "Log in" : "Create account"}</Link></p>
      </header>
      <div className="auth-grid">
        <aside className="auth-promo">
          <div className="auth-art" aria-hidden="true">
            <span className="auth-art__bubble one">Hello 👋</span>
            <span className="auth-art__bubble two">Let&apos;s talk.</span>
            <span className="auth-art__link">contactme.jrssoftware.com/you</span>
          </div>
          <h1>Start connecting<br />in seconds.</h1>
          <p>Create your account and start chatting with anyone, from any device.</p>
          <div className="auth-benefits">
            <div><span><Link2 size={20} /></span><p><b>Share your link</b><small>Get your unique link and share it anywhere.</small></p></div>
            <div><span><MessageCircle size={20} /></span><p><b>Instant conversations</b><small>No apps, no downloads, just open and chat.</small></p></div>
            <div><span><LockKeyhole size={20} /></span><p><b>Private & secure</b><small>Messages are encrypted in your browser before they leave your device.</small></p></div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-mobile-brand"><Logo /></div>
          <div className="auth-form-wrap clerk-auth-wrap">
            {isSignUp ? (
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                forceRedirectUrl="/onboarding/username"
                appearance={appearance}
              />
            ) : (
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                forceRedirectUrl="/app"
                appearance={appearance}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
