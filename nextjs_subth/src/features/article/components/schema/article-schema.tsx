interface ArticleSchemaProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  updatedAt: string;
  slug: string;
  videoCode: string;
  locale?: "th" | "en";
}

export function ArticleSchema({
  title,
  description,
  thumbnailUrl,
  publishedAt,
  updatedAt,
  slug,
  videoCode,
  locale = "th",
}: ArticleSchemaProps) {
  const basePath = locale === "en" ? "/en" : "";
  const authorPath = locale === "en" ? "/en/author/subth-editorial" : "/author/subth-editorial";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: thumbnailUrl,
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      "@type": "Person",
      name: "SubTH Editorial",
      url: `https://subth.com${authorPath}`,
      jobTitle: locale === "en" ? "Editorial Team" : "ทีมบรรณาธิการ",
      worksFor: {
        "@type": "Organization",
        name: "SubTH",
        url: "https://subth.com",
      },
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
      "@id": `https://subth.com${basePath}/articles/${slug}`,
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
