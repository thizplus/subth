interface ArticleSchemaProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  updatedAt: string;
  slug: string;
  videoCode: string;
}

export function ArticleSchema({
  title,
  description,
  thumbnailUrl,
  publishedAt,
  updatedAt,
  slug,
  videoCode,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: thumbnailUrl,
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      "@type": "Organization",
      name: "SubTH",
      url: "https://subth.com",
    },
    publisher: {
      "@type": "Organization",
      name: "SubTH",
      url: "https://subth.com",
      logo: {
        "@type": "ImageObject",
        url: "https://subth.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://subth.com/articles/${slug}`,
    },
    potentialAction: {
      "@type": "WatchAction",
      target: `https://subth.com/videos/${videoCode}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
