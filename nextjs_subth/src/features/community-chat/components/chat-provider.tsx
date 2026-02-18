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

  // Initialize WebSocket connection (only when authenticated)
  useChatWebSocket();

  // Fetch messages and online count via REST API for non-authenticated users
  useEffect(() => {
    if (isAuthenticated) return;

    // Initial fetch
    const fetchData = () => {
      getMessages(20)
        .then((msgs) => {
          setMessages(msgs);
        })
        .catch((err) => {
          console.error("Failed to fetch chat messages:", err);
        });

      getOnlineCount()
        .then((count) => {
          setOnlineCount(count);
        })
        .catch((err) => {
          console.error("Failed to fetch online count:", err);
        });
    };

    fetchData();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, setMessages, setOnlineCount]);

  return (
    <>
      {children}
      <ChatSheet locale={locale} />
    </>
  );
}
