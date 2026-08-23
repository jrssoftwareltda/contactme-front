"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const nav = [
  { href: "/app", label: "Conversations", icon: MessageCircle },
  { href: "/app/favorites", label: "Favorites", icon: Star },
  { href: "/app/archived", label: "Archived", icon: Archive },
  { href: "/app/groups", label: "Groups", icon: UsersRound },
  { href: "/app/requests", label: "Requests", icon: UserRoundPlus },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/app/chat/");

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
          <Link href="/" className="sidebar-logout"><LogOut size={18} /> Log out</Link>
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
