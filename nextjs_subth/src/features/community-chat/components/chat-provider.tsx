"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth";
import { useChatWebSocket } from "../hooks";
import { useChatStore } from "../store";
import { getMessages, getOnlineCount } from "../service";
import { ChatSheet } from "./chat-sheet";

interface ChatProviderProps {
  children: React.ReactNode;
  locale?: "th" | "en";
}

export function ChatProvider({ children, locale = "th" }: ChatProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const setMessages = useChatStore((state) => state.setMessages);
  const setOnlineCount = useChatStore((state) => state.setOnlineCount);
  const isSheetOpen = useChatStore((state) => state.isSheetOpen);

  // Initialize WebSocket connection (only when authenticated)
  useChatWebSocket();

  // Fetch initial data once on mount (for ticker + FAB badge) - no polling
  useEffect(() => {
    if (isAuthenticated) return;

    // Fetch messages once for ticker display
    getMessages(20)
      .then((msgs) => setMessages(msgs))
      .catch(() => {});

    // Fetch online count for FAB badge
    getOnlineCount()
      .then((count) => setOnlineCount(count))
      .catch(() => {});
  }, [isAuthenticated, setMessages, setOnlineCount]);

  // Fetch messages only when chat sheet is open (for non-authenticated users)
  useEffect(() => {
    if (isAuthenticated || !isSheetOpen) return;

    // Fetch messages when sheet opens
    const fetchMessages = () => {
      getMessages(20)
        .then((msgs) => setMessages(msgs))
        .catch((err) => console.error("Failed to fetch chat messages:", err));

      getOnlineCount()
        .then((count) => setOnlineCount(count))
        .catch(() => {});
    };

    fetchMessages();

    // Poll every 30 seconds only while sheet is open
    const interval = setInterval(fetchMessages, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isSheetOpen, setMessages, setOnlineCount]);

  return (
    <>
      {children}
      <ChatSheet locale={locale} />
    </>
  );
}
