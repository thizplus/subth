import type { ArticleContent, KeyMoment } from "../../types";

interface VideoObjectSchemaProps {
  content: ArticleContent;
  videoCode: string;
}

// Ensure date has ISO 8601 format with timezone
function formatDateWithTimezone(dateStr: string): string {
  if (!dateStr) return "";

  // If already has timezone (Z or +/-), return as-is
  if (dateStr.includes("T") && (dateStr.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateStr))) {
    return dateStr;
  }

  // Parse and convert to ISO with timezone
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toISOString();
}

export function VideoObjectSchema({ content, videoCode }: VideoObjectSchemaProps) {
  // Use actual existing URLs
  const videoPageUrl = content.videoId
    ? `https://subth.com/member/videos/${content.videoId}`
    : null;

  // Build hasPart (Clip) for key moments - link to article page with timestamp
  const hasPart = content.keyMoments?.map((moment: KeyMoment) => ({
    "@type": "Clip",
    name: moment.name,
    startOffset: moment.startOffset,
    endOffset: moment.endOffset,
    // Link to member video page with timestamp (actual existing page)
    ...(videoPageUrl ? { url: `${videoPageUrl}?t=${moment.startOffset}` } : {}),
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: content.videoName,
    description: content.videoDescription,
    thumbnailUrl: content.thumbnailUrl,
    uploadDate: formatDateWithTimezone(content.uploadDate),
    duration: content.duration,
    // Only include contentUrl if we have a valid video page
    ...(videoPageUrl ? { contentUrl: videoPageUrl } : {}),
    // Subscription-based access - link to login page (exists)
    isAccessibleForFree: false,
    requiresSubscription: {
      "@type": "MediaSubscription",
      name: "SubTH Premium",
      "@id": "https://subth.com/login",
    },
    // Key moments
    ...(hasPart?.length ? { hasPart } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
