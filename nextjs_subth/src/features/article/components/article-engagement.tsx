"use client";

import { useState, useCallback, useEffect } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginDialog, useAuthStore } from "@/features/auth";
import {
  useToggleArticleLike,
  ArticleCommentsSheet,
} from "@/features/engagement";
import { cn } from "@/lib/utils";

interface ArticleEngagementProps {
  articleId: string;
  locale?: "th" | "en";
  initialLikeCount?: number;
  initialCommentCount?: number;
  initialIsLiked?: boolean;
}

export function ArticleEngagement({
  articleId,
  locale = "th",
  initialLikeCount = 0,
  initialCommentCount = 0,
  initialIsLiked = false,
}: ArticleEngagementProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Like state - initialized from props
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikeCount);
  const toggleLike = useToggleArticleLike();

  // Sync state with props when articleId changes
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikesCount(initialLikeCount);
  }, [articleId, initialIsLiked, initialLikeCount]);

  const handleLike = useCallback(() => {
    if (!isAuthenticated) return;

    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    toggleLike.mutate(articleId, {
      onError: () => {
        // Revert on error
        setIsLiked(prevLiked);
        setLikesCount(prevCount);
      },
    });
  }, [isAuthenticated, toggleLike, articleId, isLiked, likesCount]);

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // TODO: Toast notification
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  }, []);

  // Like button with auth check
  const LikeButton = isAuthenticated ? (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5"
      onClick={handleLike}
      disabled={toggleLike.isPending}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isLiked && "fill-red-500 text-red-500"
        )}
      />
      <span className="text-sm">{likesCount > 0 ? likesCount : ""}</span>
    </Button>
  ) : (
    <LoginDialog locale={locale}>
      <Button variant="ghost" size="sm" className="gap-1.5">
        <Heart className="h-5 w-5" />
        <span className="text-sm">{likesCount > 0 ? likesCount : ""}</span>
      </Button>
    </LoginDialog>
  );

  return (
    <div className="flex items-center gap-1 border-t border-b py-2 my-6">
      {/* Like */}
      {LikeButton}

      {/* Comment */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => setCommentsOpen(true)}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm">
          {initialCommentCount > 0 ? initialCommentCount : ""}
        </span>
      </Button>

      {/* Comments sheet (controlled) */}
      <ArticleCommentsSheet
        articleId={articleId}
        locale={locale}
        commentsCount={initialCommentCount}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
      />

      {/* Share */}
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleShare}>
        <Share2 className="h-5 w-5" />
      </Button>

      {/* Spacer + Labels */}
      <div className="flex-1" />
      <div className="text-sm text-muted-foreground">
        {likesCount > 0 && (
          <span>
            {likesCount.toLocaleString()} {locale === "th" ? "ถูกใจ" : "likes"}
          </span>
        )}
        {likesCount > 0 && initialCommentCount > 0 && (
          <span className="mx-1">·</span>
        )}
        {initialCommentCount > 0 && (
          <span
            className="cursor-pointer hover:underline"
            onClick={() => setCommentsOpen(true)}
          >
            {initialCommentCount.toLocaleString()}{" "}
            {locale === "th" ? "ความคิดเห็น" : "comments"}
          </span>
        )}
      </div>
    </div>
  );
}
