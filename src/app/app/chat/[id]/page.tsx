import { ChatScreen } from "@/components/chat-screen";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatScreen conversationId={id} />;
}
