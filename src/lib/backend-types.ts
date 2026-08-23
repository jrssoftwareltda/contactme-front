export type UserStatus = "AVAILABLE" | "AWAY" | "BUSY" | "OFFLINE";
export type ConversationType = "DIRECT" | "GROUP";
export type MembershipStatus = "PENDING" | "ACTIVE" | "DECLINED" | "LEFT" | "BLOCKED";
export type ConversationFilter = "ALL" | "FAVORITES" | "ARCHIVED" | "GROUPS";
export type ReceiptStatus = "DELIVERED" | "READ";

export type ProfileResponse = {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  contactUrl: string | null;
};

export type PublicUserResponse = {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  contactUrl: string | null;
};

export type UsernameAvailabilityResponse = {
  username: string;
  available: boolean;
};

export type DeviceResponse = {
  id: string;
  deviceIdentifier: string;
  displayName: string | null;
  publicKeyAlgorithm: string;
  keyRevision: number;
  createdAt: string;
  lastSeenAt: string;
  active: boolean;
};

export type PublicDeviceKeyResponse = {
  deviceId: string;
  userId: string;
  publicKey: string;
  publicKeyAlgorithm: string;
  keyRevision: number;
};

export type ConversationParticipantResponse = {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: "OWNER" | "MEMBER";
  membershipStatus: MembershipStatus;
};

export type EncryptedMessageResponse = {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string | null;
  senderDeviceId: string;
  clientMessageId: string;
  ciphertext: string;
  nonce: string;
  algorithm: string;
  encryptionVersion: number;
  keyVersion: number;
  createdAt: string;
};

export type ConversationResponse = {
  id: string;
  type: ConversationType;
  title: string | null;
  avatarUrl: string | null;
  membershipStatus: MembershipStatus;
  favorite: boolean;
  archived: boolean;
  unreadCount: number;
  updatedAt: string;
  participants: ConversationParticipantResponse[];
  lastMessage: EncryptedMessageResponse | null;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type MessagePageResponse = {
  items: EncryptedMessageResponse[];
  nextBefore: string | null;
  hasMore: boolean;
};

export type ConversationKeyEnvelopeResponse = {
  conversationId: string;
  deviceId: string;
  keyVersion: number;
  encryptedConversationKey: string;
  algorithm: string;
  createdAt: string;
};

export type TypingEvent = {
  conversationId: string;
  userId: string;
  username: string | null;
  typing: boolean;
};

export type MessageReceiptEvent = {
  messageId: string;
  conversationId: string;
  userId: string;
  status: ReceiptStatus;
  occurredAt: string;
};
