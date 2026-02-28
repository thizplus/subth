import type { FAQItem } from "../../types";

interface FAQPageSchemaProps {
  faqItems: FAQItem[];
  technicalFaq?: FAQItem[];
}

export function FAQPageSchema({ faqItems, technicalFaq }: FAQPageSchemaProps) {
  const allFaqs = [...(faqItems || []), ...(technicalFaq || [])];

  if (!allFaqs.length) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
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
