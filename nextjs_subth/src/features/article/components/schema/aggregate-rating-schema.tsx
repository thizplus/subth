interface AggregateRatingSchemaProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  slug: string;
  qualityScore: number; // 1-10 scale
  locale?: "th" | "en";
}

export function AggregateRatingSchema({
  title,
  description,
  thumbnailUrl,
  slug,
  qualityScore,
  locale = "th",
}: AggregateRatingSchemaProps) {
  const basePath = locale === "en" ? "/en" : "";

  // Convert 1-10 scale to 1-5 scale for schema
  const ratingValue = (qualityScore / 2).toFixed(1);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Movie",
      name: title,
      image: thumbnailUrl,
      description: description,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: ratingValue,
      bestRating: "5",
      worstRating: "1",
    },
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
    url: `https://subth.com${basePath}/articles/${slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
