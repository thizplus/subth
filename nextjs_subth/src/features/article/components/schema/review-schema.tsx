import { SITE_URL } from "@/lib/constants";

interface ReviewSchemaProps {
  /** Title of the reviewed item (titleBalanced) */
  itemName: string;
  /** Video code (e.g., DASS-541) */
  videoCode: string;
  /** Review summary text */
  reviewBody: string;
  /** Rating value 1-5 */
  rating: number;
  /** Article slug */
  slug: string;
  /** Publish date */
  publishedAt: string;
  /** Locale */
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

export function ReviewSchema({
  itemName,
  videoCode,
  reviewBody,
  rating,
  slug,
  publishedAt,
  locale = "th",
}: ReviewSchemaProps) {
  const basePath = locale === "en" ? "/en" : "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "CreativeWork",
      name: itemName,
      identifier: videoCode,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: reviewBody,
    author: {
      "@type": "Person",
      name: "SubTH Editorial",
      url: `${SITE_URL}${basePath}/author/subth-editorial`,
    },
    publisher: {
      "@type": "Organization",
      name: "SubTH",
      url: SITE_URL,
    },
    datePublished: formatDateWithTimezone(publishedAt),
    url: `${SITE_URL}${basePath}/articles/review/${slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
