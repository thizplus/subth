/**
 * JsonLdScriptsV3 - Combined JSON-LD schemas for V3 Article pages
 * Server Component - outputs all 4 required schemas
 *
 * Schemas included:
 * 1. Article - Main article schema
 * 2. FAQPage - FAQ items
 * 3. BreadcrumbList - Navigation breadcrumbs
 * 4. VideoObject - Video metadata
 */

import { ArticleSchema } from "./article-schema";
import { FAQPageSchema } from "./faq-page-schema";
import { BreadcrumbSchema } from "./breadcrumb-schema";
import { VideoObjectSchemaV3 } from "./video-object-schema-v3";
import type { ArticleContentV3 } from "../../types";

interface JsonLdScriptsV3Props {
  content: ArticleContentV3;
  videoCode: string;
  videoId: string;
  publishedAt: string;
  locale?: "th" | "en";
}

export function JsonLdScriptsV3({
  content,
  videoCode,
  videoId,
  publishedAt,
  locale = "th",
}: JsonLdScriptsV3Props) {
  return (
    <>
      {/* 1. Article Schema */}
      <ArticleSchema
        title={content.titleBalanced}
        description={content.metaDescription}
        thumbnailUrl={content.thumbnailUrl}
        publishedAt={publishedAt}
        updatedAt={content.updatedAt}
        slug={content.slug}
        type="review"
        videoId={videoId}
        locale={locale}
      />

      {/* 2. FAQ Page Schema */}
      <FAQPageSchema faqItems={content.faqItems} />

      {/* 3. Breadcrumb Schema */}
      <BreadcrumbSchema
        title={content.titleBalanced}
        slug={content.slug}
        type="review"
        locale={locale}
      />

      {/* 4. VideoObject Schema */}
      <VideoObjectSchemaV3
        content={content}
        videoCode={videoCode}
        videoId={videoId}
        publishedAt={publishedAt}
      />
    </>
  );
}
