"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { th, enUS } from "date-fns/locale";
import { Send, Loader2, X, Reply, MessageCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/features/auth";
import { LoginDialog } from "@/features/auth";
import { useChatStore } from "../store";
import { useChatWebSocket } from "../hooks";
import type { ChatMessage } from "../types";

interface ChatSheetProps {
  locale?: "th" | "en";
}

export function ChatSheet({ locale = "th" }: ChatSheetProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAuthStore();
  const { messages, onlineCount, isConnected, isSheetOpen, replyTo, setSheetOpen, setReplyTo } =
    useChatStore();
  const { sendMessage } = useChatWebSocket();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isSheetOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSheetOpen]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !isAuthenticated || isSending) return;

      setIsSending(true);
      const success = sendMessage(newMessage.trim());

      if (success) {
        setNewMessage("");
      }
      setIsSending(false);
    },
    [newMessage, isAuthenticated, isSending, sendMessage]
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale === "th" ? th : enUS,
    });
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {locale === "th" ? "ห้องแชท" : "Chat Room"}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5" />
                      {onlineCount} {locale === "th" ? "ออนไลน์" : "online"}
                    </>
                  ) : (
                    locale === "th" ? "ไม่ได้เชื่อมต่อ" : "Disconnected"
                  )}
                </Badge>
              </div>
            </div>
          </SheetHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-2" />
                <p>{locale === "th" ? "ยังไม่มีข้อความ" : "No messages yet"}</p>
                <p className="text-sm">
                  {locale === "th"
                    ? "เป็นคนแรกที่ส่งข้อความ!"
                    : "Be the first to send a message!"}
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-3">
                {messages.map((message) => (
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    locale={locale}
                    formatTime={formatTime}
                    onReply={() => setReplyTo(message)}
                    isOwn={user?.id === message.user.id}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Reply indicator */}
          {replyTo && (
            <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Reply className="h-4 w-4" />
                <span>
                  {locale === "th" ? "ตอบกลับ" : "Replying to"}{" "}
                  <span className="font-medium">{replyTo.user.displayName}</span>
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setReplyTo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            {isAuthenticated ? (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs rounded-lg">
                    {user?.displayName?.slice(0, 2) || "TH"}
                  </AvatarFallback>
                </Avatar>
                <Input
                  placeholder={
                    locale === "th" ? "พิมพ์ข้อความ..." : "Type a message..."
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  disabled={isSending || !isConnected}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || isSending || !isConnected}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {locale === "th"
                    ? "เข้าสู่ระบบเพื่อแชท"
                    : "Login to chat"}
                </span>
                <LoginDialog locale={locale}>
                  <Button size="sm">
                    {locale === "th" ? "เข้าสู่ระบบ" : "Login"}
                  </Button>
                </LoginDialog>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Chat message item
interface ChatMessageItemProps {
  message: ChatMessage;
  locale: "th" | "en";
  formatTime: (dateString: string) => string;
  onReply: () => void;
  isOwn: boolean;
}

function ChatMessageItem({
  message,
  locale,
  formatTime,
  onReply,
  isOwn,
}: ChatMessageItemProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0 rounded-lg">
        <AvatarImage src={message.user.avatar} />
        <AvatarFallback className="text-xs rounded-lg">
          {message.user.displayName?.slice(0, 2) || "TH"}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 min-w-0 ${isOwn ? "text-right" : ""}`}>
        {/* Name & level */}
        <div className={`flex items-center gap-1 text-xs text-muted-foreground ${isOwn ? "justify-end" : ""}`}>
          <span className="font-medium">{message.user.displayName}</span>
          <span>{message.user.levelBadge}</span>
          <span>Lv.{message.user.level}</span>
        </div>

        {/* Reply indicator */}
        {message.replyTo && (
          <div className="text-xs text-muted-foreground mt-0.5 bg-muted/50 rounded px-2 py-1 inline-block">
            <Reply className="h-3 w-3 inline mr-1" />
            {message.replyTo.user.displayName}: {message.replyTo.content.slice(0, 30)}
            {message.replyTo.content.length > 30 && "..."}
          </div>
        )}

        {/* Message content */}
        <div
          className={`inline-block rounded-lg px-3 py-1.5 mt-1 max-w-[85%] ${
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <p className="text-sm break-words">{message.content}</p>
        </div>

        {/* Video mention */}
        {message.mentionedVideo && (
          <div className="mt-1 p-2 border rounded-lg bg-background inline-block max-w-[200px]">
            <div className="flex items-center gap-2">
              <img
                src={message.mentionedVideo.thumbnail}
                alt={message.mentionedVideo.code}
                className="h-12 w-16 rounded object-cover"
              />
              <div className="text-xs">
                <p className="font-medium">{message.mentionedVideo.code}</p>
              </div>
            </div>
          </div>
        )}

        {/* Time & reply button */}
        <div className={`flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground ${isOwn ? "justify-end" : ""}`}>
          <span>{formatTime(message.createdAt)}</span>
          {!isOwn && (
            <button
              onClick={onReply}
              className="hover:text-foreground transition-colors"
            >
              <Reply className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
