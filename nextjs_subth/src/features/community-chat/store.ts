"use client";

import { create } from "zustand";
import type { ChatState, ChatMessage } from "./types";

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  onlineCount: 0,
  isConnected: false,
  isSheetOpen: false,
  replyTo: null,

  setMessages: (messages: ChatMessage[]) => set({ messages }),

  addMessage: (message: ChatMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  removeMessage: (id: string) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  setOnlineCount: (onlineCount: number) => set({ onlineCount }),

  setConnected: (isConnected: boolean) => set({ isConnected }),

  setSheetOpen: (isSheetOpen: boolean) => set({ isSheetOpen }),

  setReplyTo: (replyTo: ChatMessage | null) => set({ replyTo }),

  clearMessages: () => set({ messages: [] }),
}));
