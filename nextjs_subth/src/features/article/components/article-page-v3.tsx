/**
 * ArticlePageV3 - Complete V3 Article Page Layout
 *
 * Usage: Replace the entire page content with V3 layout
 *
 * Backend ต้อง return V3 content structure:
 * - content.quickAnswer, content.verdict, content.rating
 * - content.facts (code, studio, cast, duration, genre, etc.)
 * - content.synopsis, content.featuredScene, content.keyScenes
 * - content.reviewSummary, content.strengths, content.weaknesses
 * - content.faqItems, content.searchIntents
 *
 * ```tsx
 * // app/(public)/articles/review/[slug]/page.tsx
 * import { ArticlePageV3 } from "@/features/article";
 *
 * export default async function Page({ params }) {
 *   const article = await getArticleByTypeAndSlug("review", params.slug, "th");
 *   // Transform to V3 format if needed, or backend returns V3 directly
 *   return <ArticlePageV3 article={article} locale="th" />;
 * }
 * ```
 */

import { PublicLayout } from "@/components/layout/server";
import { ArticleBreadcrumb } from "./article-breadcrumb";
import { ThumbnailWithCTA } from "./thumbnail-with-cta";
import { ThumbnailImage } from "./thumbnail-image";
import { AuthorByline } from "./author-byline";
import { TrustBadge } from "./trust-badge";
import { ArticleContentV3Component } from "./article-content-v3";
import { JsonLdScriptsV3 } from "./schema/json-ld-scripts-v3";
import type { ArticleV3 } from "../types";

interface ArticlePageV3Props {
  article: ArticleV3;
  locale?: "th" | "en";
}

export function ArticlePageV3({ article, locale = "th" }: ArticlePageV3Props) {
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
    <PublicLayout locale={locale}>
      {/* JSON-LD Schemas - SSR */}
      <JsonLdScriptsV3
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

        {/* Main Content - V3 Layout */}
        <div className="mt-8">
          <ArticleContentV3Component
            content={content}
            videoCode={article.videoCode}
            videoId={article.videoId}
          />
        </div>
      </article>
    </PublicLayout>
  );
}
