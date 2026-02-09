"use client";

import { useCallback } from "react";
import { Virtuoso } from "react-virtuoso";
import { FeedCardSocial } from "./feed-card-social";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeedItem } from "../types";

interface InfiniteFeedProps {
  items: FeedItem[];
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  locale?: "th" | "en";
}

function FeedSkeleton() {
  return (
    <div className="border-b last:border-b-0">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />
      {/* Actions skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-9 w-9 rounded" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function LoadingFooter() {
  return (
    <div className="space-y-4 sm:space-y-6 py-4">
      <FeedSkeleton />
      <FeedSkeleton />
    </div>
  );
}

/**
 * InfiniteFeed - Virtualized infinite scroll feed
 *
 * Features:
 * - react-virtuoso for performance (renders only visible items)
 * - Infinite scroll with endReached callback
 * - Dynamic item heights supported
 * - Loading skeletons
 */
export function InfiniteFeed({
  items,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  locale = "th",
}: InfiniteFeedProps) {
  // Load more when reaching end
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      onLoadMore?.();
    }
  }, [hasMore, isLoading, onLoadMore]);

  if (items.length === 0 && !isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {locale === "th" ? "ยังไม่มีเนื้อหา" : "No content yet"}
      </div>
    );
  }

  if (items.length === 0 && isLoading) {
    return <LoadingFooter />;
  }

  return (
    <Virtuoso
      useWindowScroll
      data={items}
      endReached={handleEndReached}
      overscan={3}
      itemContent={(index, item) => (
        <div className="pb-4 sm:pb-6">
          <FeedCardSocial item={item} locale={locale} />
        </div>
      )}
      components={{
        Footer: () => {
          if (isLoading) {
            return <LoadingFooter />;
          }
          if (!hasMore && items.length > 0) {
            return (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {locale === "th" ? "คุณได้ดูทั้งหมดแล้ว" : "You've seen it all"}
              </div>
            );
          }
          return null;
        },
      }}
    />
  );
}
