import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "../types";

interface ArticleCardProps {
  article: ArticleSummary;
  locale?: "th" | "en";
}

export function ArticleCard({ article, locale = "th" }: ArticleCardProps) {
  const basePath = locale === "en" ? "/en" : "";

  return (
    <Link
      href={`${basePath}/articles/${article.slug}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={article.thumbnailUrl}
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
        <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary">
          {article.title}
        </h3>

        {/* Cast names */}
        {article.castNames && article.castNames.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground truncate">
            {article.castNames.slice(0, 2).join(", ")}
            {article.castNames.length > 2 && ` +${article.castNames.length - 2}`}
          </p>
        )}

        {/* Meta */}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {article.makerName && (
            <span className="truncate">{article.makerName}</span>
          )}
          {article.publishedAt && (
            <span>
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
