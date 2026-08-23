import type { Metadata } from "next";
import { NewConversationScreen } from "@/components/new-conversation-screen";

export const metadata: Metadata = { title: "New conversation" };

export default function NewConversationPage() {
  return <NewConversationScreen />;
}
