interface BreadcrumbSchemaProps {
  title: string;
  slug: string;
}

export function BreadcrumbSchema({ title, slug }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "หน้าแรก",
        item: "https://subth.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "บทความ",
        item: "https://subth.com/articles",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `https://subth.com/articles/${slug}`,
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
