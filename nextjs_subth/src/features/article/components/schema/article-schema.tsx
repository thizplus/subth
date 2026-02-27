import { SITE_URL } from "@/lib/constants";

interface ArticleSchemaProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  updatedAt: string;
  slug: string;
  type: "review" | "ranking" | "best-of" | "guide" | "news";
  videoId?: string; // UUID for member video page
  locale?: "th" | "en";
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

export function ArticleSchema({
  title,
  description,
  thumbnailUrl,
  publishedAt,
  updatedAt,
  slug,
  type,
  videoId,
  locale = "th",
}: ArticleSchemaProps) {
  const basePath = locale === "en" ? "/en" : "";
  const authorPath = locale === "en" ? "/en/author/subth-editorial" : "/author/subth-editorial";

  // Only include potentialAction if we have a valid video page
  const videoPageUrl = videoId ? `${SITE_URL}/member/videos/${videoId}` : null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: thumbnailUrl,
    datePublished: formatDateWithTimezone(publishedAt),
    dateModified: formatDateWithTimezone(updatedAt),
    author: {
      "@type": "Person",
      name: "SubTH Editorial",
      url: `${SITE_URL}${authorPath}`,
      jobTitle: locale === "en" ? "Editorial Team" : "ทีมบรรณาธิการ",
      worksFor: {
        "@type": "Organization",
        name: "SubTH",
        url: SITE_URL,
      },
    },
    publisher: {
      "@type": "Organization",
      name: "SubTH",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${basePath}/articles/${type}/${slug}`,
    },
    // Only add potentialAction if video page exists
    ...(videoPageUrl
      ? {
          potentialAction: {
            "@type": "WatchAction",
            target: videoPageUrl,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
