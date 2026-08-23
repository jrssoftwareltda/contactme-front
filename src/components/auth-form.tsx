"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Apple, Eye, Link2, LockKeyhole, MessageCircle } from "lucide-react";
import { Logo } from "@/components/logo";

export function AuthForm({ mode }: { mode: "sign-up" | "sign-in" }) {
  const router = useRouter();
  const isSignUp = mode === "sign-up";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(isSignUp ? "/onboarding/username" : "/app");
  }

  function socialAuth() {
    router.push(isSignUp ? "/onboarding/username" : "/app");
  }

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
            <span className="auth-art__link">thecontact.me/you</span>
          </div>
          <h1>Start connecting<br />in seconds.</h1>
          <p>Create your account and start chatting with anyone, from any device.</p>
          <div className="auth-benefits">
            <div><span><Link2 size={20} /></span><p><b>Share your link</b><small>Get your unique link and share it anywhere.</small></p></div>
            <div><span><MessageCircle size={20} /></span><p><b>Instant conversations</b><small>No apps, no downloads, just open and chat.</small></p></div>
            <div><span><LockKeyhole size={20} /></span><p><b>Private & secure</b><small>Designed for private, direct conversations.</small></p></div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-mobile-brand"><Logo /></div>
          <div className="auth-form-wrap">
            <h2>{isSignUp ? "Create your account" : "Welcome back"}</h2>
            <p>{isSignUp ? "It's free and only takes a few seconds." : "Log in to continue your conversations."}</p>

            <button type="button" onClick={socialAuth} className="social-button"><strong>G</strong> Continue with Google</button>
            <button type="button" onClick={socialAuth} className="social-button"><Apple size={20} fill="currentColor" /> Continue with Apple</button>

            <div className="form-divider"><span>or</span></div>

            <form onSubmit={submit} className="auth-form">
              {isSignUp ? <label>Full name<input required placeholder="Your full name" /></label> : null}
              <label>Email<input type="email" required placeholder="you@example.com" /></label>
              <label>Password<div className="password-field"><input type="password" required placeholder={isSignUp ? "Create a password" : "Your password"} /><Eye size={18} /></div></label>
              <button className="button button--primary auth-submit" type="submit">{isSignUp ? "Create account" : "Log in"}</button>
            </form>

            <p className="auth-terms">By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
            <p className="auth-mobile-switch">{isSignUp ? "Already have an account?" : "New to Contact Me?"} <Link href={isSignUp ? "/sign-in" : "/sign-up"}>{isSignUp ? "Log in" : "Create account"}</Link></p>
            <p className="auth-note">Prototype authentication. Clerk will replace this form; e-mail verification is intentionally not duplicated in the app flow.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
