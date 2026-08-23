import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Link2,
  LockKeyhole,
  MessageCircle,
  MonitorSmartphone,
  PlayCircle,
  Users,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { LandingChatDemo } from "@/components/landing-chat-demo";

const benefits = [
  { icon: Link2, title: "Share your link", text: "Create your unique link and share it anywhere." },
  { icon: MessageCircle, title: "Start a conversation", text: "Anyone can chat with you instantly, no sign up needed." },
  { icon: Users, title: "Stay connected", text: "Keep the conversation going with real-time messaging." },
  { icon: LockKeyhole, title: "Private & secure", text: "Built with privacy-first product decisions from day one." },
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="marketing-header page-container">
        <Logo />
        <nav className="marketing-nav" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#business">For Business</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="marketing-actions">
          <Link href="/sign-in" className="text-link">Log in</Link>
          <Link href="/sign-up" className="button button--primary button--sm">Sign up free</Link>
        </div>
      </header>

      <section className="hero page-container">
        <div className="hero-copy">
          <p className="eyebrow">INSTANT WEB MESSAGING</p>
          <h1>Talk to anyone, <span>instantly.</span></h1>
          <p className="hero-description">Contact Me lets you start conversations through a simple link. No apps, no downloads, just instant connections.</p>
          <div className="hero-actions">
            <Link href="/sign-up" className="button button--primary button--lg">Create your link <ArrowRight size={20} /></Link>
            <a href="#how-it-works" className="button button--ghost button--lg">See how it works <PlayCircle size={20} /></a>
          </div>
          <div className="hero-checks">
            <span><CheckCircle2 size={17} /> No downloads</span>
            <span><CheckCircle2 size={17} /> No phone number</span>
            <span><CheckCircle2 size={17} /> Works on any device</span>
          </div>
        </div>
        <LandingChatDemo />
      </section>

      <section id="features" className="features-section">
        <div className="page-container">
          <div className="section-heading centered">
            <h2>A better way to start conversations</h2>
            <p>Share your link, start a chat, build connections. It&apos;s that simple.</p>
          </div>
          <div className="feature-grid">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article className="feature-card" key={title}>
                <span className="feature-icon"><Icon size={24} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="workflow-section page-container">
        <div className="section-heading">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>One link. One click. A conversation.</h2>
        </div>
        <div className="workflow-grid">
          <article><span>1</span><h3>Create your account</h3><p>Choose your username and get your personal Contact Me link.</p></article>
          <article><span>2</span><h3>Share your link</h3><p>Add it to social profiles, portfolios, websites, email signatures or QR codes.</p></article>
          <article><span>3</span><h3>Start talking</h3><p>People open the link in any browser and can start a conversation immediately.</p></article>
        </div>
      </section>

      <section id="business" className="business-section">
        <div className="page-container business-grid">
          <div className="business-copy">
            <p className="eyebrow">FOR BUSINESSES</p>
            <h2>Turn conversations into <span>growth.</span></h2>
            <p>Give customers a fast way to reach your team without forcing them to install another app.</p>
            <ul>
              <li><CheckCircle2 size={18} /> Add a chat link to your website or social media</li>
              <li><CheckCircle2 size={18} /> Capture leads and never miss a conversation</li>
              <li><CheckCircle2 size={18} /> Manage your team and chats in one place</li>
              <li><CheckCircle2 size={18} /> Ready for integrations and analytics</li>
            </ul>
            <a href="#pricing" className="button button--outline"><BarChart3 size={18} /> Explore for Business</a>
          </div>
          <div className="business-preview">
            <div className="business-preview__rail">
              <Users size={19} /><MessageCircle size={19} /><MonitorSmartphone size={19} />
            </div>
            <div className="business-preview__list">
              <strong>Inbox</strong>
              {['Sarah Johnson','Michael Brown','Emma Davis','James Wilson'].map((name, i) => (
                <div className="mini-contact" key={name}><span>{name.split(' ').map(x => x[0]).join('')}</span><div><b>{name}</b><small>{i === 0 ? 'Looking for more info about...' : 'Can you help me with pricing?'}</small></div></div>
              ))}
            </div>
            <div className="business-preview__chat">
              <div className="mini-chat-title">Sarah Johnson <small>● Online</small></div>
              <div className="mini-chat-thread">
                <span>Hi! I&apos;m interested in your product.</span>
                <span className="mine">Hello! I&apos;d be happy to help you.</span>
                <span>Can you send me more details?</span>
                <span className="mine">Of course! Check this out.</span>
              </div>
              <div className="mini-file">Product-Overview.pdf <small>2.4 MB</small></div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="cta-section page-container">
        <div>
          <span className="cta-icon"><Users size={24} /></span>
          <div><h2>Ready to start your conversation?</h2><p>Create your link in seconds and start connecting today.</p></div>
        </div>
        <Link href="/sign-up" className="button button--primary">Get started for free <ArrowRight size={18} /></Link>
      </section>

      <footer className="marketing-footer">
        <div className="page-container">
          <Logo />
          <nav><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#business">For Business</a><a href="#pricing">Pricing</a></nav>
          <small>© 2026 Contact Me</small>
        </div>
      </footer>
    </main>
  );
}
