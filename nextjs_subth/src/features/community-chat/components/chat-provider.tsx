"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth";
import { useChatWebSocket } from "../hooks";
import { useChatStore } from "../store";
import { getMessages } from "../service";
import { ChatSheet } from "./chat-sheet";

interface ChatProviderProps {
  children: React.ReactNode;
  locale?: "th" | "en";
}

export function ChatProvider({ children, locale = "th" }: ChatProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const setMessages = useChatStore((state) => state.setMessages);

  // Initialize WebSocket connection (only when authenticated)
  useChatWebSocket();

  // Fetch messages via REST API for non-authenticated users
  useEffect(() => {
    if (isAuthenticated) return;

    // Initial fetch
    const fetchMessages = () => {
      getMessages(20)
        .then((msgs) => {
          setMessages(msgs);
        })
        .catch((err) => {
          console.error("Failed to fetch chat messages:", err);
        });
    };

    fetchMessages();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchMessages, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, setMessages]);

  return (
    <>
      {children}
      <ChatSheet locale={locale} />
    </>
  );
}
