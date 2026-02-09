"use client";

import { ReelCard } from "./reel-card";
import type { ReelItem } from "../types";

interface ReelListProps {
  items: ReelItem[];
  locale?: "th" | "en";
}

/**
 * ReelList displays a grid of reel cards
 * Grid is optimized for vertical video thumbnails
 */
export function ReelList({ items, locale = "th" }: ReelListProps) {
  if (!items.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {locale === "th" ? "ยังไม่มี Reels" : "No reels available"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <ReelCard key={item.id} item={item} locale={locale} />
      ))}
    </div>
  );
}
