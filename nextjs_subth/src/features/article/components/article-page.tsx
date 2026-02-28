/**
 * ArticlePage - Complete Article Page Layout (Intent-Driven)
 *
 * ```tsx
 * import { ArticlePage } from "@/features/article";
 *
 * export default async function Page({ params }) {
 *   const article = await getArticleByTypeAndSlug("review", params.slug, "th");
 *   return <ArticlePage article={article} locale="th" />;
 * }
 * ```
 */

import { PublicLayout } from "@/components/layout/server";
import { ArticleBreadcrumb } from "./article-breadcrumb";
import { ThumbnailWithCTA } from "./thumbnail-with-cta";
import { ThumbnailImage } from "./thumbnail-image";
import { AuthorByline } from "./author-byline";
import { TrustBadge } from "./trust-badge";
import { ArticleMainContent } from "./article-content";
import { JsonLdScripts } from "./schema/json-ld-scripts";
import type { Article } from "../types";

interface ArticlePageProps {
  article: Article;
  locale?: "th" | "en";
}

export function ArticlePage({ article, locale = "th" }: ArticlePageProps) {
  const { content } = article;

  const breadcrumbItems =
    locale === "en"
      ? [
          { label: "Articles", href: "/en/articles" },
          { label: "Review", href: "/en/articles?type=review" },
          { label: content.titleBalanced },
        ]
      : [
          { label: "บทความ", href: "/articles" },
          { label: "รีวิว", href: "/articles?type=review" },
          { label: content.titleBalanced },
        ];

  return (
    <PublicLayout
      locale={locale}
      articleTranslations={article.translations}
      articleType={article.type || "review"}
    >
        {/* JSON-LD Schemas - SSR */}
        <JsonLdScripts
          content={content}
          videoCode={article.videoCode}
          videoId={article.videoId}
          publishedAt={article.publishedAt}
          locale={locale}
        />

        <article className="mx-auto max-w-4xl px-4 py-6 md:py-8">
          {/* Breadcrumb */}
          <ArticleBreadcrumb items={breadcrumbItems} />

          {/* Thumbnail with CTA */}
          <ThumbnailWithCTA videoId={article.videoId}>
            <ThumbnailImage
              src={content.thumbnailUrl}
              alt={content.titleBalanced}
            />
          </ThumbnailWithCTA>

          {/* H1 Title */}
          <h1 className="mt-6 text-2xl font-bold md:text-3xl">
            {content.titleBalanced}
          </h1>

          {/* Author & Trust */}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <AuthorByline
              publishedAt={article.publishedAt}
              updatedAt={content.updatedAt}
            />
            <TrustBadge updatedAt={content.updatedAt} />
          </div>

          {/* Main Content */}
          <div className="mt-8">
            <ArticleMainContent
              content={content}
              videoCode={article.videoCode}
              videoId={article.videoId}
            />
          </div>
        </article>
      </PublicLayout>
  );
}
