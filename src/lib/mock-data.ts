import type { ChatMessage, Contact, Conversation } from "@/lib/types";

export const currentUser = {
  name: "John Silva",
  username: "john",
  initials: "JS",
  status: "Available",
  link: "www.thecontact.me/john",
};

export const mockConversations: Conversation[] = [
  {
    id: "joao-silva",
    name: "João Silva",
    username: "joaosilva",
    preview: "Perfect! See you tomorrow.",
    time: "10:30",
    unread: 2,
    status: "online",
    initials: "JS",
  },
  {
    id: "maria-souza",
    name: "Maria Souza",
    username: "mariasouza",
    preview: "You: Thank you!",
    time: "09:15",
    unread: 1,
    status: "online",
    initials: "MS",
  },
  {
    id: "project-alpha",
    name: "Project Alpha",
    username: "project-alpha",
    preview: "Carlos: I sent the file.",
    time: "Yesterday",
    initials: "PA",
  },
  {
    id: "lucas-mendes",
    name: "Lucas Mendes",
    username: "lucasmendes",
    preview: "Great, agreed.",
    time: "Yesterday",
    initials: "LM",
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    username: "marketing-team",
    preview: "Ana: Meeting at 3pm.",
    time: "Sat",
    initials: "MT",
  },
];

export const mockContacts: Contact[] = [
  { id: "joao-silva", name: "João Silva", username: "joaosilva", initials: "JS", status: "online" },
  { id: "maria-souza", name: "Maria Souza", username: "mariasouza", initials: "MS", status: "online" },
  { id: "lucas-mendes", name: "Lucas Mendes", username: "lucasmendes", initials: "LM", status: "online" },
  { id: "daniel-martins", name: "Daniel Martins", username: "danielmartins", initials: "DM" },
  { id: "sarah-johnson", name: "Sarah Johnson", username: "sarahjohnson", initials: "SJ", status: "online" },
  { id: "emma-davis", name: "Emma Davis", username: "emmadavis", initials: "ED" },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  "joao-silva": [
    { id: "m1", sender: "them", text: "Hi! How are you?", time: "10:20" },
    { id: "m2", sender: "me", text: "Hi João! I'm great. How about you?", time: "10:21" },
    { id: "m3", sender: "them", text: "All good! Can you send me that file?", time: "10:22" },
    { id: "m4", sender: "me", attachment: { name: "proposal.pdf", size: "1.2 MB" }, time: "10:23" },
    { id: "m5", sender: "them", text: "Perfect! Thank you.", time: "10:24" },
  ],
  "maria-souza": [
    { id: "m1", sender: "them", text: "Hello! I found your Contact Me link.", time: "09:09" },
    { id: "m2", sender: "me", text: "Hi Maria! Nice to meet you.", time: "09:10" },
    { id: "m3", sender: "them", text: "Can we talk about your project?", time: "09:12" },
  ],
};
