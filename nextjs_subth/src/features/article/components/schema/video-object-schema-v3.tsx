import { SITE_URL } from "@/lib/constants";
import type { ArticleContent } from "../../types";

interface VideoObjectSchemaV3Props {
  content: ArticleContent;
  videoCode: string;
  videoId: string;
  publishedAt: string;
  locale?: "th" | "en";
}

// Ensure date has ISO 8601 format with timezone
function formatDateWithTimezone(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("T") && (dateStr.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateStr))) {
    return dateStr;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toISOString();
}

export function VideoObjectSchemaV3({
  content,
  videoCode,
  videoId,
  publishedAt,
  locale = "th",
}: VideoObjectSchemaV3Props) {
  const videoPageUrl = videoId ? `${SITE_URL}/member/videos/${videoId}` : null;

  // Convert durationMinutes to ISO 8601 duration
  const isoDuration = content.facts.durationMinutes
    ? `PT${content.facts.durationMinutes}M`
    : undefined;

  // Localized video name for schema
  const videoName = locale === "en"
    ? `${videoCode} English Subtitles`
    : `${videoCode} ซับไทย`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: videoName,
    description: content.metaDescription,
    thumbnailUrl: content.thumbnailUrl,
    uploadDate: formatDateWithTimezone(publishedAt),
    duration: isoDuration,
    // Only include contentUrl if we have a valid video page
    ...(videoPageUrl ? { contentUrl: videoPageUrl } : {}),
    // Subscription-based access
    isAccessibleForFree: false,
    requiresSubscription: {
      "@type": "MediaSubscription",
      name: "SubTH Premium",
      "@id": `${SITE_URL}/login`,
    },
    // Actors from cast
    ...(content.facts.cast?.length
      ? {
          actor: content.facts.cast.map((name) => ({
            "@type": "Person",
            name: name,
          })),
        }
      : {}),
    // Production company
    ...(content.facts.studio
      ? {
          productionCompany: {
            "@type": "Organization",
            name: content.facts.studio,
          },
        }
      : {}),
    // Genre
    ...(content.facts.genre?.length
      ? { genre: content.facts.genre }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
