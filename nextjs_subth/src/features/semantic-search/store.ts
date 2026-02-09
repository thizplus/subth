"use client";

import { create } from "zustand";
import type { SemanticSearchResult, ChatMessage } from "./types";

interface SemanticSearchStore {
  // Modal state
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  // Search state
  query: string;
  setQuery: (query: string) => void;
  results: SemanticSearchResult[];
  setResults: (results: SemanticSearchResult[]) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // AI Response
  aiMessage: string | null;
  setAiMessage: (message: string | null) => void;
  keywords: string[];
  setKeywords: (keywords: string[]) => void;

  // Chat messages (for future RAG)
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  // Reset
  reset: () => void;
}

export const useSemanticSearchStore = create<SemanticSearchStore>((set) => ({
  // Modal state
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  // Search state
  query: "",
  setQuery: (query) => set({ query }),
  results: [],
  setResults: (results) => set({ results }),
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),

  // AI Response
  aiMessage: null,
  setAiMessage: (aiMessage) => set({ aiMessage }),
  keywords: [],
  setKeywords: (keywords) => set({ keywords }),

  // Chat messages
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  // Reset
  reset: () =>
    set({
      query: "",
      results: [],
      isLoading: false,
      error: null,
      aiMessage: null,
      keywords: [],
      messages: [],
    }),
}));
