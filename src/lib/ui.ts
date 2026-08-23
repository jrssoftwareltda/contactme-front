import type { ConversationResponse, ConversationParticipantResponse, ProfileResponse, PublicUserResponse } from "@/lib/backend-types";

export function initials(value?: string | null): string {
  if (!value) return "CM";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CM";
}

export function userLabel(user: Pick<PublicUserResponse, "displayName" | "username"> | Pick<ConversationParticipantResponse, "displayName" | "username">): string {
  return user.displayName || user.username || "Contact Me user";
}

export function conversationLabel(conversation: ConversationResponse, profile?: ProfileResponse | null): string {
  if (conversation.title) return conversation.title;
  if (conversation.type === "GROUP") return "Group";
  const peer = conversation.participants.find((participant) => participant.userId !== profile?.id);
  return peer ? userLabel(peer) : "Conversation";
}

export function conversationPeer(conversation: ConversationResponse, profile?: ProfileResponse | null) {
  return conversation.participants.find((participant) => participant.userId !== profile?.id) ?? conversation.participants[0];
}

export function formatConversationTime(value: string): string {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
