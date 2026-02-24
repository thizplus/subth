"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Film } from "lucide-react";
import Link from "next/link";
import { useChatStore } from "../store";
import { useAuthStore, LoginDialog } from "@/features/auth";
import type { ChatMessage } from "../types";

interface ChatTickerProps {
  locale?: "th" | "en";
}

export function ChatTicker({ locale = "th" }: ChatTickerProps) {
  const messages = useChatStore((state) => state.messages);
  const { setSheetOpen } = useChatStore();
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);

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
    <div className="bg-muted/50 border-b overflow-hidden w-full max-w-full">
      <div className="relative flex items-center h-8 w-full">
        {/* Chat icon - clickable to open sheet */}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 h-full bg-primary/10 hover:bg-primary/20 transition-colors z-10 shrink-0"
          aria-label={locale === "th" ? "เปิดแชท" : "Open chat"}
        >
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary hidden sm:inline" aria-hidden="true">แชท</span>
        </button>

        {/* Marquee container */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="ticker-track inline-flex items-center gap-8 animate-ticker">
            {/* Show messages - duplicate only when we have few messages for seamless loop */}
            {(recentMessages.length < 3
              ? [...recentMessages, ...recentMessages]
              : recentMessages
            ).map((msg, idx) => (
              <TickerItem
                key={`${msg.id}-${idx}`}
                message={msg}
                locale={locale}
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
  locale: "th" | "en";
  onChatClick: () => void;
}

function TickerItem({ message, locale, onChatClick }: TickerItemProps) {
  const { isAuthenticated } = useAuthStore();

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

      {/* Video mention - clickable link or login dialog */}
      {message.mentionedVideo && (
        isAuthenticated ? (
          <Link
            href={`/member/videos/${message.mentionedVideo.id}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Film className="h-3 w-3" />
            {message.mentionedVideo.code || message.mentionedVideo.title}
          </Link>
        ) : (
          <LoginDialog locale={locale}>
            <button
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label={`${locale === "th" ? "ดู" : "View"} ${message.mentionedVideo.code || message.mentionedVideo.title}`}
            >
              <Film className="h-3 w-3" />
              {message.mentionedVideo.code || message.mentionedVideo.title}
            </button>
          </LoginDialog>
        )
      )}
    </div>
  );
}
