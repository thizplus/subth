"use client";

import { useMemo } from "react";
import { InfiniteFeed } from "./infinite-feed";
import { useInfiniteFeed } from "../hooks";
import type { FeedListResponse } from "../types";

interface FeedPageClientProps {
  initialData: FeedListResponse;
  locale?: "th" | "en";
}

/**
 * FeedPageClient - Client Component for Feed Page
 *
 * Handles:
 * - React Query infinite scroll
 * - Social-style card layout
 */
export function FeedPageClient({ initialData, locale = "th" }: FeedPageClientProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFeed({ limit: 20, lang: locale }, initialData);

  // Flatten pages to single array
  const items = useMemo(() => {
    if (!data?.pages) return [];

    const allItems = data.pages.flatMap((page) => page.data);

    // Deduplicate by id
    const uniqueItems = allItems.filter(
      (item, index, self) => index === self.findIndex((i) => i.id === item.id)
    );

    return uniqueItems;
  }, [data]);

  return (
    <InfiniteFeed
      items={items}
      hasMore={hasNextPage}
      isLoading={isFetchingNextPage}
      onLoadMore={() => fetchNextPage()}
      locale={locale}
    />
  );
}
