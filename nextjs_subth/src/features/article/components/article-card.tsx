"use client";

import Image from "next/image";
import Link from "next/link";
import { CDN_URL } from "@/lib/constants";
import { useDictionary } from "@/components/dictionary-provider";
import type { ArticleSummary } from "../types";
import { StarRating } from "./star-rating";

interface ArticleCardProps {
  article: ArticleSummary;
  priority?: boolean;
}

// Build full thumbnail URL
function getThumbnailUrl(url?: string): string {
  if (!url) return "/placeholder-video.jpg";
  if (url.startsWith("http")) return url;
  return `${CDN_URL}${url}`;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  const { t, locale, getLocalizedPath } = useDictionary();
  const thumbnailUrl = getThumbnailUrl(article.thumbnailUrl);

  return (
    <Link
      href={getLocalizedPath(`/articles/review/${article.slug}`)}
      className="group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={article.title}
          fill
          priority={priority}
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Video Code Badge */}
        <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
          {article.videoCode}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-base font-medium leading-snug group-hover:text-primary">
          {article.title}
        </h3>

        {/* Cast & Studio - same row, labels on top */}
        <div className="mt-2 flex gap-4">
          {article.castNames && article.castNames.length > 0 && (
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {t("article.castLabel")}
              </p>
              <p className="text-sm truncate">
                {article.castNames.slice(0, 2).join(", ")}
                {article.castNames.length > 2 && ` +${article.castNames.length - 2}`}
              </p>
            </div>
          )}
          {article.makerName && (
            <div className="shrink-0">
              <p className="text-xs text-muted-foreground">
                {t("article.makerLabel")}
              </p>
              <p className="text-sm">{article.makerName}</p>
            </div>
          )}
        </div>

        {/* Rating & Date */}
        <div className="mt-1.5 flex items-center justify-between">
          {article.rating ? (
            <StarRating rating={article.rating} size="sm" showScore={false} />
          ) : (
            <div />
          )}
          {article.publishedAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(article.publishedAt).toLocaleDateString(
                locale === "th" ? "th-TH" : "en-US",
                { year: "numeric", month: "short", day: "numeric" }
              )}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
