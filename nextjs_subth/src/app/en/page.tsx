import { PublicLayout } from "@/components/layout/server";
import { articleService, ArticleCard, ItemListSchema } from "@/features/article";
import { PageActivityLogger } from "@/features/activity";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JAV Thai Subtitle | In-Depth Japanese AV Reviews Updated Daily",
  description:
    "The most comprehensive JAV Thai subtitle review site. In-depth analysis of storylines, AV actresses, studios, with viewer ratings. New JAV with Thai sub updated daily.",
  keywords: [
    "jav thai subtitle",
    "jav thai sub",
    "japanese av thai subtitle",
    "jav with thai subtitles",
    "jav review",
    "av thai sub",
  ],
  openGraph: {
    title: "JAV Thai Subtitle | In-Depth Japanese AV Reviews",
    description:
      "The most comprehensive JAV Thai subtitle review site. In-depth analysis updated daily.",
    url: "https://subth.com/en",
    type: "website",
    siteName: "SubTH - JAV Thai Subtitle",
  },
  alternates: {
    canonical: "https://subth.com/en",
    languages: {
      th: "https://subth.com",
      en: "https://subth.com/en",
    },
  },
};

/**
 * Public Homepage - JAV Thai Subtitle Reviews (English)
 */
export default async function EnglishHomePage() {
  let articles: import("@/features/article").ArticleSummary[] = [];
  let total = 0;

  try {
    const response = await articleService.getList({
      page: 1,
      limit: 12,
      lang: "en",
    });
    articles = response.data || [];
    total = response.meta?.total || 0;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
  }

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SubTH - JAV Thai Subtitle",
    alternateName: ["SubTH", "JAV Thai Sub", "JAV Thai Subtitle"],
    url: "https://subth.com/en",
    description:
      "In-depth JAV Thai subtitle reviews. Japanese AV analysis with Thai subtitles.",
    inLanguage: ["en", "th"],
    publisher: {
      "@type": "Organization",
      name: "SubTH",
      url: "https://subth.com",
    },
  };

  // FAQ Schema for long-tail keywords
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is JAV Thai Subtitle?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JAV Thai Subtitle refers to Japanese Adult Videos (JAV) with Thai language subtitles. This allows Thai-speaking viewers to understand the storyline and dialogue, enhancing the viewing experience significantly.",
        },
      },
      {
        "@type": "Question",
        name: "How does SubTH review JAV content?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SubTH provides in-depth JAV reviews analyzing storyline, acting performance, production quality, and subtitle accuracy. We include comprehensive information about AV actresses, studios, and genre tags.",
        },
      },
      {
        "@type": "Question",
        name: "How often is new JAV Thai Subtitle content added?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SubTH updates with new JAV Thai subtitle reviews daily. We curate quality content from top studios like S1, MOODYZ, Ideapocket, and Prestige with carefully translated Thai subtitles.",
        },
      },
    ],
  };

  return (
    <PublicLayout locale="en">
      {/* Activity Logger */}
      <PageActivityLogger pageType="home" />

      {/* ItemList Schema for SEO */}
      <ItemListSchema
        articles={articles}
        listName="Latest JAV Thai Subtitle Reviews"
        listDescription="In-depth JAV Thai subtitle reviews updated daily"
        locale="en"
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-7xl px-4">
        {/* Hero Section - SEO Optimized */}
        <section className="mb-8">
          <h1 className="mb-3 text-2xl sm:text-3xl font-bold">
            JAV Thai Subtitle | In-Depth Reviews Updated Daily
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Welcome to <strong>SubTH</strong>, the most comprehensive{" "}
            <strong>JAV Thai subtitle</strong> review site. We curate and
            analyze quality Japanese AV content with carefully translated Thai
            subtitles, helping you understand every storyline in depth. From top
            studios like S1, MOODYZ, Prestige to popular AV actresses, we review
            everything you need to know.
          </p>
        </section>

        {/* Latest Reviews Section */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-primary rounded-full"></span>
            Latest JAV Thai Subtitle Reviews
          </h2>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} locale="en" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No reviews yet
            </div>
          )}

          {/* View All Link */}
          {total > 12 && (
            <div className="mt-6 text-center">
              <a
                href="/en/articles"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
              >
                View All {total.toLocaleString()} Reviews →
              </a>
            </div>
          )}
        </section>

        {/* Why SubTH Section */}
        <section className="mb-10 py-8 px-6 bg-muted/50 rounded-2xl border border-border">
          <h2 className="mb-4 text-xl font-semibold">
            Why Read JAV Reviews on SubTH?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-xl border border-border">
              <h3 className="font-medium mb-2">In-Depth Analysis</h3>
              <p className="text-sm text-muted-foreground">
                We analyze storylines, performances, and highlights of each
                title, helping you decide what matches your taste.
              </p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <h3 className="font-medium mb-2">Quality Thai Subtitles</h3>
              <p className="text-sm text-muted-foreground">
                We only feature content with properly translated Thai subtitles,
                not machine translations.
              </p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <h3 className="font-medium mb-2">Daily Updates</h3>
              <p className="text-sm text-muted-foreground">
                Stay updated with new releases from all major studios. Never
                miss trending titles.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section - SEO Long-tail Keywords */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-primary rounded-full"></span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            <details className="group p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">
                What is JAV Thai Subtitle?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                <strong>JAV Thai Subtitle</strong> refers to Japanese Adult
                Videos (JAV) with Thai language subtitles. This allows
                Thai-speaking viewers to fully understand the storyline and
                dialogue, making the viewing experience much more enjoyable and
                immersive than watching without subtitles.
              </p>
            </details>

            <details className="group p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">
                How does SubTH review JAV content?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                SubTH provides <strong>in-depth JAV reviews</strong> analyzing
                storyline, acting performance, production quality, and subtitle
                accuracy. We include comprehensive information about AV
                actresses, studios, and genre tags to help you find exactly what
                you're looking for.
              </p>
            </details>

            <details className="group p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">
                How often is new content added?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                SubTH updates with new <strong>JAV Thai subtitle</strong>{" "}
                reviews daily. We curate quality content from top studios like
                S1, MOODYZ, Ideapocket, Prestige, and more, with carefully
                translated Thai subtitles.
              </p>
            </details>

            <details className="group p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">
                Can I search by actress or studio?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Yes! SubTH has a search and filter system by AV actress, studio,
                and genre tags. Whether you have a favorite actress or prefer
                certain genres, you can easily find matching content.
              </p>
            </details>
          </div>
        </section>

        {/* About Section */}
        <section className="py-6 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            <strong>SubTH</strong> is a JAV Thai subtitle review site focused on
            delivering in-depth content analysis. We believe great viewing isn't
            just about visuals—understanding the story matters. That's why Thai
            subtitles are essential. Follow our daily reviews here.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}
