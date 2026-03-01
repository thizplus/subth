"use client";

import { useState, useCallback, useEffect } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
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
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  }, []);

  const likeText = locale === "th" ? "ถูกใจ" : "Like";
  const commentText = locale === "th" ? "ความคิดเห็น" : "Comment";
  const shareText = locale === "th" ? "แชร์" : "Share";
  const copiedText = locale === "th" ? "คัดลอกแล้ว!" : "Copied!";

  // Like button
  const LikeBtn = (
    <button
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
        "hover:bg-muted active:scale-95",
        isLiked
          ? "text-red-500"
          : "text-muted-foreground hover:text-foreground"
      )}
      onClick={isAuthenticated ? handleLike : undefined}
      disabled={toggleLike.isPending}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all",
          isLiked && "fill-current"
        )}
      />
      <span>{likesCount > 0 ? likesCount : ""} {likeText}</span>
    </button>
  );

  return (
    <div className="flex items-center gap-2 py-2 mt-2 mb-6">
      {/* Like */}
      {isAuthenticated ? (
        LikeBtn
      ) : (
        <LoginDialog locale={locale}>{LikeBtn}</LoginDialog>
      )}

      <span className="text-muted-foreground/30">|</span>

      {/* Comment */}
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
        onClick={() => setCommentsOpen(true)}
      >
        <MessageCircle className="h-5 w-5" />
        <span>{initialCommentCount > 0 ? initialCommentCount : ""} {commentText}</span>
      </button>

      {/* Comments sheet (controlled) */}
      <ArticleCommentsSheet
        articleId={articleId}
        locale={locale}
        commentsCount={initialCommentCount}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
      />

      <span className="text-muted-foreground/30">|</span>

      {/* Share */}
      <button
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95",
          copied
            ? "text-green-500"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        onClick={handleShare}
      >
        <Share2 className="h-5 w-5" />
        <span>{copied ? copiedText : shareText}</span>
      </button>
    </div>
  );
}
