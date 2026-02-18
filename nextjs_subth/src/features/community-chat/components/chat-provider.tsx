"use client";

import { useChatWebSocket } from "../hooks";
import { ChatSheet } from "./chat-sheet";

interface ChatProviderProps {
  children: React.ReactNode;
  locale?: "th" | "en";
}

export function ChatProvider({ children, locale = "th" }: ChatProviderProps) {
  // Initialize WebSocket connection
  useChatWebSocket();

  return (
    <>
      {children}
      <ChatSheet locale={locale} />
    </>
  );
}
