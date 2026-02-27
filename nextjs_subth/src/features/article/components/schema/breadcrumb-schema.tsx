import { SITE_URL } from "@/lib/constants";

interface BreadcrumbSchemaProps {
  title: string;
  slug: string;
  type: "review" | "ranking" | "best-of" | "guide" | "news";
  locale?: "th" | "en";
}

const TYPE_LABELS: Record<string, { th: string; en: string }> = {
  review: { th: "รีวิว", en: "Review" },
  ranking: { th: "จัดอันดับ", en: "Ranking" },
  "best-of": { th: "รวมที่สุด", en: "Best Of" },
  guide: { th: "คู่มือ", en: "Guide" },
  news: { th: "ข่าว", en: "News" },
};

export function BreadcrumbSchema({ title, slug, type, locale = "th" }: BreadcrumbSchemaProps) {
  const basePath = locale === "en" ? "/en" : "";
  const baseUrl = `${SITE_URL}${basePath}`;
  const typeLabel = TYPE_LABELS[type]?.[locale] || type;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "en" ? "Home" : "หน้าแรก",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "en" ? "Articles" : "บทความ",
        item: `${baseUrl}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: typeLabel,
        item: `${baseUrl}/articles?type=${type}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: title,
        item: `${baseUrl}/articles/${type}/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
