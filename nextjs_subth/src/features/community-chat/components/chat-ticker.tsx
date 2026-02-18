"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useChatStore } from "../store";
import { useLatestMessage } from "../hooks";

export function ChatTicker() {
  const latestMessage = useLatestMessage();
  const { setSheetOpen } = useChatStore();
  const [displayMessage, setDisplayMessage] = useState<typeof latestMessage>(null);

  // Animate in new messages
  useEffect(() => {
    if (latestMessage) {
      setDisplayMessage(latestMessage);
    }
  }, [latestMessage]);

  if (!displayMessage) {
    return null;
  }

  return (
    <div
      className="bg-muted/50 border-b cursor-pointer hover:bg-muted transition-colors"
      onClick={() => setSheetOpen(true)}
    >
      <div className="container max-w-4xl mx-auto px-4 py-1.5">
        <div className="flex items-center gap-2 text-sm">
          <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-xs">
            {displayMessage.user.levelBadge} {displayMessage.user.displayName}:
          </span>
          <span className="truncate text-muted-foreground">
            {displayMessage.content}
          </span>
        </div>
      </div>
    </div>
  );
}
