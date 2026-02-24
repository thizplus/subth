interface HowToSchemaProps {
  title: string;
  description: string;
  tips: string; // Paragraph text, will be split into steps
  videoCode: string;
  locale?: "th" | "en";
}

export function HowToSchema({
  title,
  description,
  tips,
  videoCode,
  locale = "th",
}: HowToSchemaProps) {
  if (!tips) {
    return null;
  }

  // Split tips by sentences or newlines to create steps
  const steps = tips
    .split(/[.。]\s*|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10); // Filter out very short fragments

  if (steps.length === 0) {
    return null;
  }

  const baseUrl = "https://subth.com";
  const pathPrefix = locale === "en" ? "/en" : "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description: description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
      name: `${locale === "th" ? "ขั้นตอนที่" : "Step"} ${index + 1}`,
    })),
    // Link to the article
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}${pathPrefix}/articles/${videoCode.toLowerCase()}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
