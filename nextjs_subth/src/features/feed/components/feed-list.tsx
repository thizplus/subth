"use client";

import { FeedCard } from "./feed-card";
import type { FeedItem } from "../types";

interface FeedListProps {
  items: FeedItem[];
  locale?: "th" | "en";
}

/**
 * FeedList displays a grid of feed cards
 * For larger lists, consider using react-virtuoso
 */
export function FeedList({ items, locale = "th" }: FeedListProps) {
  if (!items.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {locale === "th" ? "ยังไม่มีวิดีโอ" : "No videos available"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} locale={locale} />
      ))}
    </div>
  );
}
