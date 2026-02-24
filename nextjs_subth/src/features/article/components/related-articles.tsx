import Link from "next/link";
import Image from "next/image";
import { RelatedVideo } from "../types";

interface RelatedArticlesProps {
  articles: RelatedVideo[];
  locale?: "th" | "en";
}

export function RelatedArticles({
  articles,
  locale = "th",
}: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  const basePath = locale === "en" ? "/en" : "";

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">
        {locale === "en" ? "Related Articles" : "บทความที่เกี่ยวข้อง"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, 6).map((article) => (
          <Link
            key={article.id}
            href={`${basePath}/articles/${article.url}`}
            className="group flex gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md">
              <Image
                src={article.thumbnailUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="96px"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs font-medium text-primary">
                {article.code}
              </span>
              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                {article.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
