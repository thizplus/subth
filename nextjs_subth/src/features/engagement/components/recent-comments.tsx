"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { MessageCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { engagementService } from "../service";
import type { RecentComment } from "../types";

interface RecentCommentsProps {
  locale?: "th" | "en";
  limit?: number;
}

export function RecentComments({ locale = "th", limit = 15 }: RecentCommentsProps) {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await engagementService.getRecentComments(limit);
        if (response.success) {
          setComments(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch recent comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();

    // Refresh every 30 seconds
    const interval = setInterval(fetchComments, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: th,
    });
  };

  const getInitials = (comment: RecentComment) => {
    if (comment.user?.displayName) {
      return comment.user.displayName.slice(0, 2).toUpperCase();
    }
    return "TH";
  };

  const title = locale === "th" ? "ความคิดเห็นล่าสุด" : "Recent Comments";

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          {title}
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          {title}
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          {locale === "th" ? "ยังไม่มีความคิดเห็น" : "No comments yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          {title}
        </h3>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="p-3 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar className="h-8 w-8 flex-shrink-0 rounded-lg">
                <AvatarImage src={comment.user?.avatar} />
                <AvatarFallback className="text-xs rounded-lg">
                  {getInitials(comment)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-0.5">
                {/* User info */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium truncate">
                    {comment.user?.displayName || "TH#000000000"}
                  </span>
                  <span className="text-muted-foreground">
                    {comment.user?.levelBadge || "⭐"} Lv.{comment.user?.level || 1}
                  </span>
                </div>

                {/* Comment content */}
                <p className="text-sm line-clamp-2 break-words">
                  {comment.content}
                </p>

                {/* Time */}
                <p className="text-[11px] text-muted-foreground">
                  {formatTime(comment.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
