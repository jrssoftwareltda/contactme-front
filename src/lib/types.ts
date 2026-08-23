export type ChatMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  failed?: boolean;
};
