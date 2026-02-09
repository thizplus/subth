"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { ReelItem } from "./reel-item";
import { cn } from "@/lib/utils";
import type { ReelItem as ReelItemType } from "../types";

interface ReelsFeedProps {
  reels: ReelItemType[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
  /** Number of items to render around active (default: 3) */
  renderWindow?: number;
}

/**
 * ReelsFeed - TikTok-style Snap Scroll Container
 *
 * Features:
 * - CSS Snap Scroll (mandatory, y-axis)
 * - Intersection Observer for active detection
 * - Auto-play active reel
 * - Infinite scroll (load more on bottom)
 * - Global mute state
 * - Windowed rendering for performance
 */
export function ReelsFeed({
  reels,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
  renderWindow = 3,
}: ReelsFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const observerRefs = useRef<Map<number, IntersectionObserver>>(new Map());

  // Calculate render window indices
  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, activeIndex - renderWindow);
    const end = Math.min(reels.length - 1, activeIndex + renderWindow);
    return { startIndex: start, endIndex: end };
  }, [activeIndex, renderWindow, reels.length]);

  // Toggle global mute
  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Intersection observer callback
  const handleIntersection = useCallback(
    (index: number) => (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setActiveIndex(index);

          // Load more when reaching near end
          if (index >= reels.length - 2 && hasMore && !isLoading) {
            onLoadMore?.();
          }
        }
      });
    },
    [reels.length, hasMore, isLoading, onLoadMore]
  );

  // Setup observers for each reel
  const setupObserver = useCallback(
    (element: HTMLDivElement | null, index: number) => {
      if (!element) return;

      // Cleanup existing observer
      const existing = observerRefs.current.get(index);
      if (existing) {
        existing.disconnect();
      }

      // Create new observer
      const observer = new IntersectionObserver(handleIntersection(index), {
        threshold: [0.5, 1.0],
        root: containerRef.current,
      });

      observer.observe(element);
      observerRefs.current.set(index, observer);
    },
    [handleIntersection]
  );

  // Cleanup observers on unmount
  useEffect(() => {
    return () => {
      observerRefs.current.forEach((observer) => observer.disconnect());
    };
  }, []);

  if (reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-reels-text">
        <p className="text-lg">No Reels available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full overflow-y-scroll",
        "snap-y snap-mandatory",
        "scrollbar-hide",
        className
      )}
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {reels.map((reel, index) => {
        const isActive = activeIndex === index;
        const isAdjacent = Math.abs(activeIndex - index) === 1;
        const isInWindow = index >= startIndex && index <= endIndex;

        // Windowed rendering - render placeholder for items outside window
        if (!isInWindow) {
          return (
            <div
              key={reel.id}
              ref={(el) => setupObserver(el, index)}
              className="h-[100dvh] w-full snap-start snap-always bg-reels-bg"
            />
          );
        }

        return (
          <div key={reel.id} ref={(el) => setupObserver(el, index)}>
            <ReelItem
              reel={reel}
              isActive={isActive}
              isAdjacent={isAdjacent}
              isMuted={isMuted}
              onMuteToggle={handleMuteToggle}
            />
          </div>
        );
      })}

      {/* Loading indicator */}
      {isLoading && (
        <div className="h-[100dvh] flex items-center justify-center bg-reels-bg snap-start">
          <div className="w-10 h-10 border-4 border-reels-text-subtle border-t-reels-text rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
