"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "../store";

export function ChatFab() {
  const { onlineCount, isConnected, setSheetOpen } = useChatStore();

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6">
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg relative"
        onClick={() => setSheetOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
        {isConnected && onlineCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px]"
          >
            {onlineCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
