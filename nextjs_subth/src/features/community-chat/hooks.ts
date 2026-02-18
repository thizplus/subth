"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/features/auth";
import { useChatStore } from "./store";
import { getWebSocketUrl } from "./service";
import type {
  ChatMessage,
  WSServerMessage,
  WSChatHistory,
  WSChatOnlineCount,
  WSClientMessage,
} from "./types";

export function useChatWebSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const {
    setMessages,
    addMessage,
    removeMessage,
    setOnlineCount,
    setConnected,
    replyTo,
    setReplyTo,
  } = useChatStore();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token || !isAuthenticated) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(getWebSocketUrl(token));

    ws.onopen = () => {
      setConnected(true);

      // Start ping interval
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSServerMessage = JSON.parse(event.data);

        switch (msg.type) {
          case "history": {
            const history = msg.data as WSChatHistory;
            setMessages(history.messages);
            break;
          }
          case "message": {
            const message = msg.data as ChatMessage;
            addMessage(message);
            break;
          }
          case "online_count": {
            const data = msg.data as WSChatOnlineCount;
            setOnlineCount(data.count);
            break;
          }
          case "message_deleted": {
            const data = msg.data as { id: string };
            removeMessage(data.id);
            break;
          }
          case "error": {
            console.error("Chat error:", msg.data);
            break;
          }
        }
      } catch {
        console.error("Failed to parse message:", event.data);
      }
    };

    ws.onclose = () => {
      setConnected(false);

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;
  }, [token, isAuthenticated, setMessages, addMessage, removeMessage, setOnlineCount, setConnected]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, [setConnected]);

  // Send message
  const sendMessage = useCallback(
    (content: string, videoId?: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return false;
      }

      const msg: WSClientMessage = {
        type: "message",
        content,
        replyTo: replyTo?.id,
        videoId,
      };

      wsRef.current.send(JSON.stringify(msg));
      setReplyTo(null);
      return true;
    },
    [replyTo, setReplyTo]
  );

  // Auto connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
  };
}

// Hook for latest message (for ticker)
export function useLatestMessage() {
  const messages = useChatStore((state) => state.messages);
  return messages.length > 0 ? messages[messages.length - 1] : null;
}
