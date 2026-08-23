export type Conversation = {
  id: string;
  name: string;
  username: string;
  preview: string;
  time: string;
  unread?: number;
  status?: "online" | "offline";
  initials: string;
};

export type Contact = {
  id: string;
  name: string;
  username: string;
  initials: string;
  status?: "online" | "offline";
};

export type ChatMessage = {
  id: string;
  sender: "me" | "them";
  text?: string;
  time: string;
  attachment?: {
    name: string;
    size: string;
  };
};
