"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelOverlayProps {
  title?: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  locale?: "th" | "en";
  className?: string;
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
 * ReelOverlay - Bottom Info Overlay
 *
 * Shows title by default, click to expand for description & tags
 */
export function ReelOverlay({
  title,
  description,
  tags = [],
  createdAt,
  locale = "th",
  className,
}: ReelOverlayProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = description || tags.length > 0;

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-10",
        "px-4 py-3 bg-black/70",
        className
      )}
    >
      {/* Header with avatar and content */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-reels-text">
            {locale === "th" ? "ซับ" : "ST"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title - clickable to expand */}
          {title && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasDetails) setExpanded(!expanded);
              }}
              className={cn(
                "flex items-center gap-2 text-left w-full",
                hasDetails && "cursor-pointer"
              )}
            >
              <p className={cn(
                "text-reels-text text-sm flex-1 leading-none",
                !expanded && "line-clamp-1"
              )}>
                {title}
              </p>
              {hasDetails && (
                <span className="text-reels-text-muted flex-shrink-0">
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </span>
              )}
            </button>
          )}

          {/* Name and time - line 2 */}
          <div className="flex items-center gap-1 leading-none">
            <span className="text-reels-text-muted text-xs">
              {locale === "th" ? "ซับไทย" : "SubTH"}
            </span>
            {createdAt && (
              <span className="text-reels-text-muted text-xs">
                • {formatRelativeTime(createdAt, locale)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Description */}
          {description && (
            <p className="text-reels-text-muted text-sm mb-2">
              {description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="text-reels-text-muted text-xs font-normal"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
