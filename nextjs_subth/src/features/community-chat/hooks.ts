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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // Get store actions (these are stable)
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const removeMessage = useChatStore((state) => state.removeMessage);
  const setOnlineCount = useChatStore((state) => state.setOnlineCount);
  const setConnected = useChatStore((state) => state.setConnected);
  const replyTo = useChatStore((state) => state.replyTo);
  const setReplyTo = useChatStore((state) => state.setReplyTo);
  const messages = useChatStore((state) => state.messages);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token || !isAuthenticated) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;
    if (isConnectingRef.current) return;

    isConnectingRef.current = true;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(getWebSocketUrl(token));

    ws.onopen = () => {
      isConnectingRef.current = false;
      setConnected(true);

      // Clear any existing ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

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
            // Check for duplicate by ID
            const currentMessages = useChatStore.getState().messages;
            const isDuplicate = currentMessages.some((m) => m.id === message.id);
            if (!isDuplicate) {
              addMessage(message);
            }
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
      isConnectingRef.current = false;
      setConnected(false);

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Only reconnect if still authenticated
      if (useAuthStore.getState().isAuthenticated) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = () => {
      isConnectingRef.current = false;
    };

    wsRef.current = ws;
  }, [token, isAuthenticated, setMessages, addMessage, removeMessage, setOnlineCount, setConnected]);

  // Disconnect
  const disconnect = useCallback(() => {
    isConnectingRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

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
