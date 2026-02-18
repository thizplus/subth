// User info in chat
export interface ChatUserInfo {
  id: string;
  username: string;
  displayName: string;
  level: number;
  levelBadge: string;
  avatar: string;
}

// Video mention in chat
export interface ChatVideoInfo {
  id: string;
  code: string;
  title: string;
  thumbnail: string;
}

// Chat message
export interface ChatMessage {
  id: string;
  user: ChatUserInfo;
  content: string;
  mentionedVideo?: ChatVideoInfo;
  replyTo?: ChatMessage;
  createdAt: string;
}

// WebSocket client message types
export interface WSClientMessage {
  type: "message" | "typing" | "ping";
  content?: string;
  replyTo?: string;
  videoId?: string;
}

// WebSocket server message types
export type WSServerMessageType =
  | "message"
  | "history"
  | "online_count"
  | "user_join"
  | "user_leave"
  | "message_deleted"
  | "error"
  | "pong";

export interface WSServerMessage {
  type: WSServerMessageType;
  data?: unknown;
}

export interface WSChatHistory {
  messages: ChatMessage[];
}

export interface WSChatOnlineCount {
  count: number;
}

export interface WSChatUserEvent {
  user: ChatUserInfo;
}

export interface WSChatError {
  message: string;
}

// Chat store state
export interface ChatState {
  messages: ChatMessage[];
  onlineCount: number;
  isConnected: boolean;
  isSheetOpen: boolean;
  replyTo: ChatMessage | null;

  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  removeMessage: (id: string) => void;
  setOnlineCount: (count: number) => void;
  setConnected: (connected: boolean) => void;
  setSheetOpen: (open: boolean) => void;
  setReplyTo: (message: ChatMessage | null) => void;
  clearMessages: () => void;
}
