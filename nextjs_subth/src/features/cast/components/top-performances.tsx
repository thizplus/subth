import Link from "next/link";
import Image from "next/image";
import { Trophy, Star } from "lucide-react";
import { ArticleSummary } from "@/features/article";

interface TopPerformancesProps {
  articles: ArticleSummary[];
  castName: string;
  locale?: "th" | "en";
}

export function TopPerformances({
  articles,
  castName,
  locale = "th",
}: TopPerformancesProps) {
  // Show top 3 articles (assume sorted by qualityScore from API)
  const topArticles = articles.slice(0, 3);

  if (topArticles.length === 0) return null;

  const basePath = locale === "en" ? "/en" : "";
  const rankColors = [
    "text-yellow-500", // 1st - Gold
    "text-gray-400",   // 2nd - Silver
    "text-amber-600",  // 3rd - Bronze
  ];

  return (
    <section className="mb-8">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        {locale === "en"
          ? `Best Performances by ${castName}`
          : `ผลงานเด่นของ ${castName}`}
      </h2>

      <div className="grid gap-3 sm:grid-cols-3">
        {topArticles.map((article, index) => (
          <Link
            key={article.slug}
            href={`${basePath}/articles/review/${article.slug}`}
            className="group relative flex gap-3 rounded-xl border bg-gradient-to-br from-card to-muted/30 p-4 transition-all hover:shadow-md hover:border-primary/30"
          >
            {/* Rank Badge */}
            <div className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-background border-2 border-current shadow-sm z-10">
              <span className={`text-sm font-bold ${rankColors[index]}`}>
                {index + 1}
              </span>
            </div>

            {/* Thumbnail */}
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={article.thumbnailUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="112px"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs font-semibold text-primary">
                {article.videoCode}
              </span>
              <h3 className="text-sm font-medium line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              {index === 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    {locale === "en" ? "Top Rated" : "คะแนนสูงสุด"}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
