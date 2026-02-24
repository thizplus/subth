"use client";

import { MessageCircle } from "lucide-react";
import { useChatStore } from "../store";

export function ChatFab() {
  const { onlineCount, isConnected, setSheetOpen } = useChatStore();

  return (
    <button
      onClick={() => setSheetOpen(true)}
      className="fixed z-50 bottom-20 right-4 md:bottom-6 md:right-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
      aria-label="Community Chat"
    >
      <MessageCircle className="h-5 w-5" />
      {/* Online count badge */}
      {onlineCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold text-white shadow">
          {onlineCount}
        </span>
      )}
    </button>
  );
}
