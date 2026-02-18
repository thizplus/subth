"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, Film } from "lucide-react";
import Link from "next/link";
import { useChatStore } from "../store";
import type { ChatMessage } from "../types";

export function ChatTicker() {
  const messages = useChatStore((state) => state.messages);
  const { setSheetOpen } = useChatStore();
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Get last 5 messages for ticker
  useEffect(() => {
    if (messages.length > 0) {
      setRecentMessages(messages.slice(-5));
    }
  }, [messages]);

  if (recentMessages.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/50 border-b overflow-hidden">
      <div className="relative flex items-center h-8">
        {/* Chat icon - clickable to open sheet */}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 h-full bg-primary/10 hover:bg-primary/20 transition-colors z-10 shrink-0"
        >
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary hidden sm:inline">แชท</span>
        </button>

        {/* Marquee container */}
        <div className="flex-1 overflow-hidden">
          <div className="ticker-track flex items-center gap-8 animate-ticker">
            {/* Duplicate messages for seamless loop */}
            {[...recentMessages, ...recentMessages].map((msg, idx) => (
              <TickerItem
                key={`${msg.id}-${idx}`}
                message={msg}
                onChatClick={() => setSheetOpen(true)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TickerItemProps {
  message: ChatMessage;
  onChatClick: () => void;
}

function TickerItem({ message, onChatClick }: TickerItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm whitespace-nowrap shrink-0">
      {/* User info */}
      <span
        className="font-medium text-xs cursor-pointer hover:text-primary transition-colors"
        onClick={onChatClick}
      >
        {message.user.levelBadge} {message.user.displayName}:
      </span>

      {/* Message content */}
      <span
        className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        onClick={onChatClick}
      >
        {message.content}
      </span>

      {/* Video mention - clickable link */}
      {message.mentionedVideo && (
        <Link
          href={`/member/videos/${message.mentionedVideo.id}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Film className="h-3 w-3" />
          {message.mentionedVideo.code}
        </Link>
      )}
    </div>
  );
}
