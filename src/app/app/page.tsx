import type { Metadata } from "next";
import { ConversationsScreen } from "@/components/conversations-screen";

export const metadata: Metadata = { title: "Conversations" };

export default function AppHomePage() {
  return <ConversationsScreen />;
}
