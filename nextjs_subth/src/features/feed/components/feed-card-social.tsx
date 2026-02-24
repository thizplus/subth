"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Share2, Play, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { useToggleLike, CommentsSheet } from "@/features/engagement";
import { cn } from "@/lib/utils";
import type { FeedItem } from "../types";

interface FeedCardSocialProps {
  item: FeedItem;
  locale?: "th" | "en";
}

function formatRelativeTime(dateString: string, locale: "th" | "en"): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === "th") {
    if (diffMins < 1) return "เมื่อสักครู่";
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return date.toLocaleDateString("th-TH");
  } else {
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US");
  }
}

/**
 * FeedCardSocial - Facebook/Instagram style feed card
 * Single column, full width, with engagement actions
 */
export function FeedCardSocial({ item, locale = "th" }: FeedCardSocialProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Like state - initialized from API response
  const [isLiked, setIsLiked] = useState(item.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(item.likeCount ?? 0);
  const toggleLike = useToggleLike();

  // Sync state with props when item changes
  useEffect(() => {
    setIsLiked(item.isLiked ?? false);
    setLikesCount(item.likeCount ?? 0);
  }, [item.id, item.isLiked, item.likeCount]);

  const handleLike = useCallback(() => {
    if (!isAuthenticated) return;

    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    toggleLike.mutate(item.id, {
      onError: () => {
        // Revert on error
        setIsLiked(prevLiked);
        setLikesCount(prevCount);
      },
    });
  }, [isAuthenticated, toggleLike, item.id, isLiked, likesCount]);

  const handleWatch = useCallback(() => {
    const basePath = locale === "en" ? "/en" : "";
    if (item.videoId) {
      window.location.href = `${basePath}/member/videos/${item.videoId}`;
    } else {
      window.location.href = `${basePath}/reels`;
    }
  }, [locale, item.videoId]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/feed/${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: item.description || "",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // TODO: Toast notification
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  }, [item]);

  // Like button with auth check
  const LikeButton = isAuthenticated ? (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={handleLike}
      disabled={toggleLike.isPending}
    >
      <Heart
        className={cn(
          "h-6 w-6 transition-colors",
          isLiked && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  ) : (
    <LoginDialog locale={locale}>
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Heart className="h-6 w-6" />
      </Button>
    </LoginDialog>
  );

  return (
    <Card className="overflow-hidden border-x-0 rounded-none sm:border-x sm:rounded-lg">
      {/* Header - Fixed branding */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-base font-bold text-primary-foreground">
              {locale === "th" ? "ซับ" : "ST"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm">
              {locale === "th" ? "ซับไทย" : "SubTH"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(item.createdAt, locale)}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Cover Image - 1:1 like Instagram */}
      <div
        className="relative aspect-square w-full bg-muted cursor-pointer group"
        onClick={() => {
          if (isAuthenticated) {
            const basePath = locale === "en" ? "/en" : "";
            if (item.videoId) {
              // ไปหน้า video detail
              window.location.href = `${basePath}/member/videos/${item.videoId}`;
            } else {
              // ถ้าไม่มี videoId ไปหน้า reels แทน
              window.location.href = `${basePath}/reels`;
            }
          }
        }}
      >
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
            fetchPriority="high"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="h-16 w-16 rounded-full bg-black/60 flex items-center justify-center">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </div>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4">
        {/* Action buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {LikeButton}

            {/* Comment button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCommentsOpen(true)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>

            {/* Comments sheet (controlled) */}
            <CommentsSheet
              reelId={item.id}
              locale={locale}
              commentsCount={item.commentCount ?? 0}
              open={commentsOpen}
              onOpenChange={setCommentsOpen}
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleShare}
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
          {isAuthenticated ? (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={handleWatch}
            >
              <Play className="h-4 w-4" />
              {locale === "th" ? "ดูวิดีโอ" : "Watch"}
            </Button>
          ) : (
            <LoginDialog locale={locale}>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Play className="h-4 w-4" />
                {locale === "th" ? "ดูวิดีโอ" : "Watch"}
              </Button>
            </LoginDialog>
          )}
        </div>

        {/* Engagement counts */}
        {(likesCount > 0 || (item.commentCount ?? 0) > 0) && (
          <p className="text-sm font-semibold mb-2">
            {likesCount > 0 && (
              <span>{likesCount.toLocaleString()} {locale === "th" ? "ถูกใจ" : "likes"}</span>
            )}
            {likesCount > 0 && (item.commentCount ?? 0) > 0 && (
              <span className="mx-1">·</span>
            )}
            {(item.commentCount ?? 0) > 0 && (
              <span
                className="cursor-pointer hover:underline"
                onClick={() => setCommentsOpen(true)}
              >
                {item.commentCount?.toLocaleString()} {locale === "th" ? "ความคิดเห็น" : "comments"}
              </span>
            )}
          </p>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-sm mb-2 line-clamp-2">{item.description}</p>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.tags.slice(0, 5).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                #{tag}
              </Badge>
            ))}
            {item.tags.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{item.tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
