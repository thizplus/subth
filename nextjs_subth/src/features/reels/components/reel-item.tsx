"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ReelVideoPlayer } from "./reel-video-player";
import { ReelActionBar } from "./reel-action-bar";
import { ReelOverlay } from "./reel-overlay";
import { DoubleTapHeart } from "./double-tap-heart";
import { useAuthStore, LoginDialog } from "@/features/auth";
import { useToggleLike, CommentsSheet } from "@/features/engagement";
import { useRecordView } from "@/features/user-stats";
import { cn } from "@/lib/utils";
import type { ReelItem as ReelItemType } from "../types";

interface ReelItemProps {
  reel: ReelItemType;
  isActive: boolean;
  isAdjacent?: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  locale?: "th" | "en";
  className?: string;
}

/**
 * ReelItem - Single Reel Card (Full Viewport Height)
 *
 * Combines:
 * - Video player (full screen)
 * - Action bar (right side)
 * - Info overlay (bottom)
 * - Double-tap heart animation
 */
export function ReelItem({
  reel,
  isActive,
  isAdjacent = false,
  isMuted,
  onMuteToggle,
  locale = "th",
  className,
}: ReelItemProps) {
  const [showHeart, setShowHeart] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(reel.isSaved || false);
  const [showComments, setShowComments] = useState(false);

  const { isAuthenticated } = useAuthStore();

  // Like state - initialized from API response
  const [isLiked, setIsLiked] = useState(reel.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(reel.likeCount ?? 0);
  const toggleLike = useToggleLike();
  const commentsCount = reel.commentCount ?? 0;

  // View tracking
  const recordView = useRecordView();
  const watchStartRef = useRef<number>(0);
  const viewRecordedRef = useRef<boolean>(false);

  // Sync state with props when reel changes
  useEffect(() => {
    setIsLiked(reel.isLiked ?? false);
    setLikesCount(reel.likeCount ?? 0);
    // Reset view tracking when reel changes
    viewRecordedRef.current = false;
    watchStartRef.current = 0;
  }, [reel.id, reel.isLiked, reel.likeCount]);

  // Track watch time and record view when active
  useEffect(() => {
    if (isActive && isAuthenticated) {
      watchStartRef.current = Date.now();
    }
  }, [isActive, isAuthenticated]);

  // Record view when criteria met (30 sec or 50%)
  useEffect(() => {
    if (!isActive || !isAuthenticated || viewRecordedRef.current) return;

    const watchDuration = watchStartRef.current > 0
      ? Math.floor((Date.now() - watchStartRef.current) / 1000)
      : 0;

    // Check criteria: 30 seconds OR 50% progress
    if (watchDuration >= 30 || videoProgress >= 50) {
      viewRecordedRef.current = true;
      recordView.mutate({
        reelId: reel.id,
        data: {
          watchDuration,
          watchPercent: videoProgress,
        },
      });
    }
  }, [videoProgress, isActive, isAuthenticated, reel.id, recordView]);

  // Handle double-tap like
  const handleDoubleTap = useCallback(() => {
    if (!isAuthenticated) return;

    if (!isLiked) {
      setShowHeart(true);
      // Optimistic update
      const prevLiked = isLiked;
      const prevCount = likesCount;
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);

      toggleLike.mutate(reel.id, {
        onError: () => {
          // Revert on error
          setIsLiked(prevLiked);
          setLikesCount(prevCount);
        },
      });
      setTimeout(() => setShowHeart(false), 800);
    }
  }, [isLiked, likesCount, isAuthenticated, toggleLike, reel.id]);

  // Handle like button click (toggle)
  const handleLikeClick = useCallback(() => {
    if (!isAuthenticated) return;

    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    toggleLike.mutate(reel.id, {
      onError: () => {
        // Revert on error
        setIsLiked(prevLiked);
        setLikesCount(prevCount);
      },
    });

    if (!isLiked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
  }, [isLiked, likesCount, isAuthenticated, toggleLike, reel.id]);

  // Handle save
  const handleSaveClick = useCallback(() => {
    setIsSaved((prev) => !prev);
    // TODO: Implement save/bookmark API
  }, []);

  // Handle share
  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/reels/${reel.id}`;
    const shareData = {
      title: reel.title || "Check out this reel",
      text: reel.description || "",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // TODO: Show toast "Link copied"
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  }, [reel.id, reel.title, reel.description]);

  // Handle comment
  const handleComment = useCallback(() => {
    setShowComments(true);
  }, []);

  return (
    <div
      className={cn(
        "relative w-full h-[100dvh] snap-start snap-always",
        "bg-reels-bg",
        className
      )}
    >
      {/* Video Player */}
      <ReelVideoPlayer
        src={reel.videoUrl}
        poster={reel.thumbUrl || reel.coverUrl}
        isActive={isActive}
        isAdjacent={isAdjacent}
        isMuted={isMuted}
        onMuteToggle={onMuteToggle}
        onDoubleTap={handleDoubleTap}
        onProgress={setVideoProgress}
      />

      {/* Double-tap Heart Animation */}
      <DoubleTapHeart show={showHeart} />

      {/* Action Bar (Right Side) - with auth check for like */}
      {isAuthenticated ? (
        <ReelActionBar
          likes={likesCount}
          comments={commentsCount}
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={handleLikeClick}
          onComment={handleComment}
          onShare={handleShare}
          onSave={handleSaveClick}
        />
      ) : (
        <ReelActionBarWithLogin
          likes={likesCount}
          comments={commentsCount}
          isSaved={isSaved}
          onComment={handleComment}
          onShare={handleShare}
          onSave={handleSaveClick}
          locale={locale}
        />
      )}

      {/* Comments Sheet - controlled mode */}
      <CommentsSheet
        reelId={reel.id}
        locale={locale}
        commentsCount={commentsCount}
        open={showComments}
        onOpenChange={setShowComments}
      />

      {/* Bottom Overlay (Caption, Tags) */}
      <ReelOverlay
        title={reel.title}
        description={reel.description}
        tags={reel.tags}
        createdAt={reel.createdAt}
        locale={locale}
      />

      {/* Progress Bar (bottom edge) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-reels-text-subtle/30 z-20">
        <div
          className="h-full bg-reels-text transition-all duration-100"
          style={{ width: `${videoProgress}%` }}
        />
      </div>
    </div>
  );
}

// Action bar for non-authenticated users (like requires login)
interface ReelActionBarWithLoginProps {
  likes: number;
  comments: number;
  isSaved: boolean;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  locale: "th" | "en";
}

import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";

function ReelActionBarWithLogin({
  likes,
  comments,
  isSaved,
  onComment,
  onShare,
  onSave,
  locale,
}: ReelActionBarWithLoginProps) {
  return (
    <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5">
      {/* Like Button - Login Required */}
      <LoginDialog locale={locale}>
        <button className="flex flex-col items-center gap-1">
          <div className="p-2 rounded-full text-reels-text">
            <Heart className="h-7 w-7" />
          </div>
          <span className="text-xs text-reels-text font-medium">
            {formatCount(likes)}
          </span>
        </button>
      </LoginDialog>

      {/* Comment Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onComment();
        }}
        className="flex flex-col items-center gap-1"
      >
        <div className="p-2 rounded-full text-reels-text">
          <MessageCircle className="h-7 w-7" />
        </div>
        <span className="text-xs text-reels-text font-medium">
          {formatCount(comments)}
        </span>
      </button>

      {/* Share Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShare();
        }}
        className="flex flex-col items-center gap-1"
      >
        <div className="p-2 rounded-full text-reels-text">
          <Share2 className="h-7 w-7" />
        </div>
        <span className="text-xs text-reels-text font-medium">Share</span>
      </button>

      {/* Save Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSave();
        }}
        className="flex flex-col items-center gap-1"
      >
        <div
          className={cn(
            "p-2 rounded-full transition-colors",
            isSaved ? "text-yellow-400" : "text-reels-text"
          )}
        >
          <Bookmark className={cn("h-7 w-7", isSaved && "fill-current")} />
        </div>
        <span className="text-xs text-reels-text font-medium">
          {isSaved ? "Saved" : "Save"}
        </span>
      </button>
    </div>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return String(count);
}

