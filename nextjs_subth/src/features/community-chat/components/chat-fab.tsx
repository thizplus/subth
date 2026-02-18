"use client";

import { MessageCircle } from "lucide-react";
import { useChatStore } from "../store";

export function ChatFab() {
  const { onlineCount, isConnected, setSheetOpen } = useChatStore();

  return (
    <div className="fixed z-50 flex flex-col items-center gap-1 bottom-4 right-4 md:bottom-6 md:right-6 md:gap-2">
      <button
        onClick={() => setSheetOpen(true)}
        className="relative flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 fab-glow h-12 w-12 md:h-16 md:w-16"
        aria-label="Community Chat"
      >
        <MessageCircle className="h-6 w-6 md:h-8 md:w-8" />
        {/* Animated ring effect */}
        <span className="absolute inset-0 rounded-full bg-primary/30 fab-ring" />
        {/* Online count badge */}
        {onlineCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 md:h-6 md:min-w-6 items-center justify-center rounded-full bg-green-500 px-1 md:px-1.5 text-[10px] md:text-xs font-bold text-white shadow">
            {onlineCount}
          </span>
        )}
      </button>
      <span className="text-[10px] md:text-xs font-medium text-muted-foreground whitespace-nowrap">
        ห้องแชท
      </span>
    </div>
  );
}
