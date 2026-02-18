"use client";

import { MessageCircle } from "lucide-react";
import { useChatStore } from "../store";

export function ChatFab() {
  const { onlineCount, isConnected, setSheetOpen } = useChatStore();

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-center gap-2">
      <button
        onClick={() => setSheetOpen(true)}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 fab-glow"
        aria-label="Community Chat"
      >
        <MessageCircle className="h-8 w-8" />
        {/* Animated ring effect */}
        <span className="absolute inset-0 rounded-full bg-primary/30 fab-ring" />
        {/* Online count badge */}
        {isConnected && onlineCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-green-500 px-1.5 text-xs font-bold text-white shadow">
            {onlineCount}
          </span>
        )}
      </button>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        ห้องแชท
      </span>
    </div>
  );
}
