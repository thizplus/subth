import { CDN_URL } from "@/lib/constants";
import type { ArticleSummary } from "../../types";

interface ItemListSchemaProps {
  articles: ArticleSummary[];
  listName: string;
  listDescription: string;
  locale?: "th" | "en";
}

export function ItemListSchema({
  articles,
  listName,
  listDescription,
  locale = "th",
}: ItemListSchemaProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  const baseUrl = "https://subth.com";
  const pathPrefix = locale === "en" ? "/en" : "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    description: listDescription,
    numberOfItems: articles.length,
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Article",
        name: article.title,
        url: `${baseUrl}${pathPrefix}/articles/${article.slug}`,
        image: article.thumbnailUrl?.startsWith("http")
          ? article.thumbnailUrl
          : `${CDN_URL}/${article.thumbnailUrl}`,
        datePublished: article.publishedAt,
        description: article.metaDescription,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
