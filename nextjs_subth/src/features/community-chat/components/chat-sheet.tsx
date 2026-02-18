"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { th, enUS } from "date-fns/locale";
import { Send, Loader2, X, Reply, MessageCircle, Film } from "lucide-react";
import Link from "next/link";
import { CDN_URL } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/features/auth";
import { LoginDialog } from "@/features/auth";
import { useChatStore } from "../store";
import { useChatWebSocket } from "../hooks";
import { VideoMentionPicker } from "./video-mention-picker";
import type { ChatMessage } from "../types";
import type { VideoSearchResult } from "../service";

interface ChatSheetProps {
  locale?: "th" | "en";
}

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function ChatSheet({ locale = "th" }: ChatSheetProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoSearchResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

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
      const success = sendMessage(newMessage.trim(), selectedVideo?.id);

      if (success) {
        setNewMessage("");
        setSelectedVideo(null);
        setShowMentionPicker(false);
        setMentionQuery("");
      }
      setIsSending(false);
    },
    [newMessage, isAuthenticated, isSending, sendMessage, selectedVideo]
  );

  // Handle input change - detect @ for mention
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Check for @ mention pattern
    const atIndex = value.lastIndexOf("@");
    if (atIndex !== -1) {
      const textAfterAt = value.slice(atIndex + 1);
      // Only show picker if @ is at start or after space
      const charBeforeAt = value[atIndex - 1];
      if (atIndex === 0 || charBeforeAt === " ") {
        // Check if there's no space after the query (still typing)
        if (!textAfterAt.includes(" ")) {
          setMentionQuery(textAfterAt);
          setShowMentionPicker(true);
          return;
        }
      }
    }
    setShowMentionPicker(false);
    setMentionQuery("");
  }, []);

  // Handle video selection from picker
  const handleVideoSelect = useCallback((video: VideoSearchResult) => {
    setSelectedVideo(video);
    setShowMentionPicker(false);
    setMentionQuery("");

    // Remove @query from message
    const atIndex = newMessage.lastIndexOf("@");
    if (atIndex !== -1) {
      setNewMessage(newMessage.slice(0, atIndex).trim());
    }

    // Focus back to input
    inputRef.current?.focus();
  }, [newMessage]);

  // Clear selected video
  const handleClearVideo = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale === "th" ? th : enUS,
    });
  };

  // Shared chat content
  const chatContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 px-4" ref={scrollRef}>
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
        <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between shrink-0">
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

      {/* Input - fixed at bottom */}
      <div className="border-t p-4 shrink-0 bg-background">
        {isAuthenticated ? (
          <div className="space-y-2">
            {/* Selected video preview */}
            {selectedVideo && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Film className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate flex-1">
                  {selectedVideo.titleTh || selectedVideo.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={handleClearVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
              {/* Video mention picker */}
              {showMentionPicker && (
                <VideoMentionPicker
                  query={mentionQuery}
                  onSelect={handleVideoSelect}
                  onClose={() => {
                    setShowMentionPicker(false);
                    setMentionQuery("");
                  }}
                />
              )}

              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs rounded-lg">
                  {user?.displayName?.slice(0, 2) || "TH"}
                </AvatarFallback>
              </Avatar>
              <Input
                ref={inputRef}
                placeholder={
                  locale === "th" ? "พิมพ์ข้อความ... (@รหัสหนัง)" : "Type a message... (@code)"
                }
                value={newMessage}
                onChange={handleInputChange}
                className="flex-1"
                disabled={isSending || !isConnected}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0"
                disabled={!newMessage.trim() || isSending || !isConnected}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
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
  );

  // Mobile: Drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={isSheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {locale === "th" ? "ห้องแชท" : "Chat Room"}
              </DrawerTitle>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                  {isConnected ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5" />
                      {onlineCount} {locale === "th" ? "ออนไลน์" : "online"}
                    </>
                  ) : (
                    locale === "th" ? "ออฟไลน์" : "Offline"
                  )}
                </Badge>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>
          {chatContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Sheet from right
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
          {chatContent}
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

        {/* Video mention - separate block */}
        {message.mentionedVideo && (
          <Link
            href={`/member/videos/${message.mentionedVideo.id}`}
            className="mt-3 block p-2 border rounded-lg bg-card max-w-[160px] hover:bg-accent transition-colors shadow-sm"
          >
            {message.mentionedVideo.thumbnail && (
              <img
                src={message.mentionedVideo.thumbnail.startsWith('http')
                  ? message.mentionedVideo.thumbnail
                  : `${CDN_URL}${message.mentionedVideo.thumbnail}`}
                alt={message.mentionedVideo.code || message.mentionedVideo.title}
                className="w-full aspect-video rounded object-cover bg-muted"
              />
            )}
            <p className="mt-1.5 text-xs font-medium text-center truncate">
              {message.mentionedVideo.code || message.mentionedVideo.title || "Video"}
            </p>
          </Link>
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
