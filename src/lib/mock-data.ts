export type Contact = {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  status?: "online" | "offline";
  lastSeen?: string;
};

export type Conversation = {
  id: string;
  contact: Contact;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  updatedAt?: string;
};

export type MessageAttachment = {
  id?: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
};

export type ChatMessage = {
  id: string;
  conversationId?: string;
  senderId: string;
  content: string;
  createdAt: string;

  attachment?: MessageAttachment;
};