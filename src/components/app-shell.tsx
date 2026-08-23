"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  Archive,
  LogOut,
  MessageCircle,
  Plus,
  Settings,
  Star,
  UserRound,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useContactMe } from "@/providers/contactme-provider";

const nav = [
  { href: "/app", label: "Conversations", icon: MessageCircle },
  { href: "/app/favorites", label: "Favorites", icon: Star },
  { href: "/app/archived", label: "Archived", icon: Archive },
  { href: "/app/groups", label: "Groups", icon: UsersRound },
  { href: "/app/requests", label: "Requests", icon: UserRoundPlus },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { profile, loading, error } = useContactMe();
  const isChat = pathname.startsWith("/app/chat/");

  useEffect(() => {
    if (!loading && profile && !profile.username) router.replace("/onboarding/username");
  }, [loading, profile, router]);

  if (loading) return <main className="app-gate"><div className="app-spinner" /><p>Connecting securely…</p></main>;
  if (error) return <main className="app-gate"><h2>Unable to connect</h2><p>{error}</p><button className="button button--primary" onClick={() => location.reload()}>Try again</button></main>;
  if (!profile?.username) return <main className="app-gate"><div className="app-spinner" /><p>Finishing your profile…</p></main>;

  async function logout() {
    await signOut({ redirectUrl: "/" });
  }

  return (
    <div className={`app-shell ${isChat ? "app-shell--chat" : ""}`}>
      <aside className="app-sidebar">
        <Logo href="/app" />
        <Link href="/app/new" className="button button--primary sidebar-new"><Plus size={18} /> New conversation</Link>
        <nav className="sidebar-nav">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
            return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={18} />{label}</Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/app/profile" className={pathname.startsWith("/app/profile") ? "active" : ""}><UserRound size={18} /> Profile</Link>
          <Link href="/app/settings" className={pathname.startsWith("/app/settings") ? "active" : ""}><Settings size={18} /> Settings</Link>
          <button type="button" onClick={logout} className="sidebar-logout"><LogOut size={18} /> Log out</button>
        </div>
      </aside>
      <main className="app-main">{children}</main>
      {!isChat ? (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          <Link href="/app" className={pathname === "/app" ? "active" : ""}><MessageCircle size={20} /><span>Chats</span></Link>
          <Link href="/app/groups" className={pathname.startsWith("/app/groups") ? "active" : ""}><UsersRound size={20} /><span>Groups</span></Link>
          <Link href="/app/new" className="mobile-compose"><Plus size={22} /><span>New</span></Link>
          <Link href="/app/requests" className={pathname.startsWith("/app/requests") ? "active" : ""}><UserRoundPlus size={20} /><span>Requests</span></Link>
          <Link href="/app/settings" className={pathname.startsWith("/app/settings") ? "active" : ""}><Settings size={20} /><span>Settings</span></Link>
        </nav>
      ) : null}
    </div>
  );
}
