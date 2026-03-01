"use client";

import { useState, useCallback, useEffect } from "react";
import { Heart, MessageCircle, Share2, Link2 } from "lucide-react";
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

  const likeLabel = locale === "th" ? "ถูกใจ" : "Like";
  const commentLabel = locale === "th" ? "แสดงความคิดเห็น" : "Comment";
  const shareLabel = copied
    ? locale === "th"
      ? "คัดลอกแล้ว!"
      : "Copied!"
    : locale === "th"
      ? "แชร์"
      : "Share";

  // Like button content
  const LikeButtonContent = (
    <>
      <Heart
        className={cn(
          "h-5 w-5 transition-all",
          isLiked && "fill-red-500 text-red-500 scale-110"
        )}
      />
      <span>
        {likesCount > 0 ? `${likesCount} ${likeLabel}` : likeLabel}
      </span>
    </>
  );

  return (
    <div className="my-6 rounded-xl border bg-muted/30 p-4">
      {/* Engagement Stats */}
      {(likesCount > 0 || initialCommentCount > 0) && (
        <div className="flex items-center gap-4 mb-3 pb-3 border-b text-sm text-muted-foreground">
          {likesCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              {likesCount.toLocaleString()} {locale === "th" ? "คนถูกใจ" : "likes"}
            </span>
          )}
          {initialCommentCount > 0 && (
            <span
              className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
              onClick={() => setCommentsOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
              {initialCommentCount.toLocaleString()} {locale === "th" ? "ความคิดเห็น" : "comments"}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        {/* Like */}
        {isAuthenticated ? (
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 gap-2 h-10 font-medium transition-all",
              isLiked && "bg-red-500 hover:bg-red-600 text-white border-red-500"
            )}
            onClick={handleLike}
            disabled={toggleLike.isPending}
          >
            {LikeButtonContent}
          </Button>
        ) : (
          <LoginDialog locale={locale}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 h-10 font-medium"
            >
              {LikeButtonContent}
            </Button>
          </LoginDialog>
        )}

        {/* Comment */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2 h-10 font-medium"
          onClick={() => setCommentsOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
          <span>{commentLabel}</span>
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
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex-1 gap-2 h-10 font-medium transition-all",
            copied && "bg-green-500 hover:bg-green-600 text-white border-green-500"
          )}
          onClick={handleShare}
        >
          {copied ? <Link2 className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
          <span>{shareLabel}</span>
        </Button>
      </div>
    </div>
  );
}
