"use client";

import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelActionBarProps {
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  className?: string;
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

/**
 * ReelActionBar - TikTok-style Action Buttons (Right Side)
 *
 * Actions:
 * - Like (heart)
 * - Comment
 * - Share
 * - Save/Bookmark
 */
export function ReelActionBar({
  likes,
  comments,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onShare,
  onSave,
  className,
}: ReelActionBarProps) {
  return (
    <div
      className={cn(
        "absolute right-3 bottom-32 z-20",
        "flex flex-col items-center gap-5",
        className
      )}
    >
      {/* Like Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLike();
        }}
        className="flex flex-col items-center gap-1"
      >
        <div
          className={cn(
            "p-2 rounded-full transition-colors",
            isLiked ? "text-reels-action-active" : "text-reels-text"
          )}
        >
          <Heart
            className={cn("h-7 w-7", isLiked && "fill-current")}
          />
        </div>
        <span className="text-xs text-reels-text font-medium">
          {formatCount(likes)}
        </span>
      </button>

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
          <Bookmark
            className={cn("h-7 w-7", isSaved && "fill-current")}
          />
        </div>
        <span className="text-xs text-reels-text font-medium">
          {isSaved ? "Saved" : "Save"}
        </span>
      </button>
    </div>
  );
}
