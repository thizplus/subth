import Image from "next/image";
import Link from "next/link";
import { CDN_URL } from "@/lib/constants";
import type { ArticleSummary } from "../types";

interface ArticleCardProps {
  article: ArticleSummary;
  locale?: "th" | "en";
}

// Build full thumbnail URL
function getThumbnailUrl(url?: string): string {
  if (!url) return "/placeholder-video.jpg";
  if (url.startsWith("http")) return url;
  return `${CDN_URL}${url}`;
}

export function ArticleCard({ article, locale = "th" }: ArticleCardProps) {
  const basePath = locale === "en" ? "/en" : "";
  const thumbnailUrl = getThumbnailUrl(article.thumbnailUrl);

  return (
    <Link
      href={`${basePath}/articles/review/${article.slug}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={article.title}
          fill
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

        {/* Cast names */}
        {article.castNames && article.castNames.length > 0 && (
          <div className="mt-2">
            <span className="text-xs text-muted-foreground/70">
              {locale === "th" ? "นักแสดง" : "Cast"}
            </span>
            <p className="text-sm truncate">
              {article.castNames.slice(0, 2).join(", ")}
              {article.castNames.length > 2 && ` +${article.castNames.length - 2}`}
            </p>
          </div>
        )}

        {/* Meta */}
        <div className="mt-2 flex items-end justify-between">
          {article.makerName && (
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground/70">
                {locale === "th" ? "ค่าย" : "Studio"}
              </span>
              <p className="text-sm truncate">{article.makerName}</p>
            </div>
          )}
          {article.publishedAt && (
            <span className="shrink-0 text-xs text-muted-foreground">
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
