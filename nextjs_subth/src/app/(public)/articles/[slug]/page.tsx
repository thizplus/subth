import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout";
import {
  articleService,
  AudioPlayer,
  ThumbnailWithCTA,
  KeyMomentsPreview,
  GallerySection,
  FAQAccordion,
  QuoteCard,
  TechnicalSpecs,
  CastCard,
  MakerCard,
  TagsList,
  ExpertBox,
  ContextualLinks,
  VideoObjectSchema,
  FAQPageSchema,
  ArticleSchema,
  BreadcrumbSchema,
  // Chunk 4: Deep Analysis Sections
  CharacterJourneySection,
  CinematographySection,
  EducationalSection,
  ViewingTipsSection,
  // Navigation
  TableOfContents,
  ArticleBreadcrumb,
  // Author
  AuthorByline,
} from "@/features/article";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await articleService.getBySlug(slug);

    return {
      title: article.metaTitle,
      description: article.metaDescription,
      openGraph: {
        type: "video.other",
        title: article.metaTitle,
        description: article.metaDescription,
        images: [
          {
            url: article.content.thumbnailUrl,
            width: 1280,
            height: 720,
            alt: article.content.thumbnailAlt,
          },
        ],
        siteName: "SubTH",
      },
      twitter: {
        card: "summary_large_image",
        title: article.metaTitle,
        description: article.metaDescription,
        images: [article.content.thumbnailUrl],
      },
      alternates: {
        canonical: `/articles/${slug}`,
      },
    };
  } catch {
    return {
      title: "บทความไม่พบ | SubTH",
    };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  let article;
  try {
    article = await articleService.getBySlug(slug);
  } catch {
    notFound();
  }

  const { content } = article;

  return (
    <PublicLayout locale="th">
      {/* Schema.org JSON-LD */}
      <VideoObjectSchema content={content} videoCode={article.videoCode} />
      <FAQPageSchema
        faqItems={content.faqItems}
        technicalFaq={content.technicalFaq}
      />
      <ArticleSchema
        title={article.title}
        description={article.metaDescription}
        thumbnailUrl={content.thumbnailUrl}
        publishedAt={article.publishedAt}
        updatedAt={content.updatedAt}
        slug={article.slug}
        videoCode={article.videoCode}
        locale="th"
      />
      <BreadcrumbSchema title={article.title} slug={article.slug} />

      <article className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        {/* 0. Breadcrumb Navigation */}
        <ArticleBreadcrumb
          items={[
            { label: "บทความ", href: "/articles" },
            { label: article.title },
          ]}
          locale="th"
        />

        {/* 1. Thumbnail with CTA (above the fold) */}
        <ThumbnailWithCTA
          thumbnailUrl={content.thumbnailUrl}
          thumbnailAlt={content.thumbnailAlt}
          videoId={content.videoId}
          title={article.title}
          locale="th"
        />

        {/* 2. Summary Short */}
        {content.summaryShort && (
          <p className="mt-4 text-lg text-muted-foreground">
            {content.summaryShort}
          </p>
        )}

        {/* 2.5 Audio Summary Player */}
        <AudioPlayer
          audioUrl={content.audioSummaryUrl}
          audioDuration={content.audioDuration}
        />

        {/* 2.6 Table of Contents (Mobile-first, Dynamic) */}
        <TableOfContents content={content} />

        {/* 3. Key Moments Preview */}
        <div className="mt-6">
          <KeyMomentsPreview
            keyMoments={content.keyMoments}
            duration={content.duration}
            videoId={content.videoId}
            locale="th"
          />
        </div>

        {/* 4. Title (H1) */}
        <h1 className="mt-8 text-2xl font-bold md:text-3xl">{article.title}</h1>

        {/* 4.5 Author Byline */}
        <div className="mt-3">
          <AuthorByline
            publishedAt={article.publishedAt}
            updatedAt={content.updatedAt}
            locale="th"
          />
        </div>

        {/* 5. Cast/Maker/Tags */}
        <div className="mt-6 space-y-4 rounded-xl border bg-gradient-to-b from-muted/30 to-transparent p-4">
          <div className="flex flex-wrap gap-6">
            <CastCard casts={content.castProfiles} />
            <MakerCard maker={content.makerInfo} />
          </div>
          <TagsList tags={content.tagDescriptions} />
        </div>

        {/* 6. Summary */}
        <section id="summary" className="mt-8 scroll-mt-20">
          <h2 className="mb-4 text-xl font-semibold">เรื่องย่อ</h2>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            {content.summary.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* 7. Character Journey (Chunk 4) */}
        <div id="character-journey" className="scroll-mt-20">
          <CharacterJourneySection
            characterJourney={content.characterJourney}
            emotionalArc={content.emotionalArc}
          />
        </div>

        {/* 8. Expert Box */}
        <div className="mt-8">
          <ExpertBox
            expertAnalysis={content.expertAnalysis}
            dialogueAnalysis={content.dialogueAnalysis}
            characterInsight={content.characterInsight}
          />
        </div>

        {/* 9. Cinematography (Chunk 4) */}
        <div id="cinematography" className="scroll-mt-20">
          <CinematographySection
            cinematographyAnalysis={content.cinematographyAnalysis}
            visualStyle={content.visualStyle}
            atmosphereNotes={content.atmosphereNotes}
          />
        </div>

        {/* 10. Gallery Section */}
        <div id="gallery" className="mt-8 scroll-mt-20">
          <GallerySection
            images={content.galleryImages || []}
            memberCount={content.memberGalleryCount}
            videoId={content.videoId}
            videoCode={article.videoCode}
            locale="th"
          />
        </div>

        {/* 11. Top Quotes */}
        <div className="mt-8">
          <QuoteCard
            quotes={content.topQuotes || []}
            videoId={content.videoId}
            locale="th"
          />
        </div>

        {/* 12. Detailed Review */}
        {content.detailedReview && (
          <section id="review" className="mt-8 scroll-mt-20">
            <h2 className="mb-4 text-xl font-semibold">รีวิวละเอียด</h2>
            <div className="space-y-4 leading-relaxed text-muted-foreground">
              {content.detailedReview.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* 13. Educational & Comparative (Chunk 4) */}
        <div id="educational" className="scroll-mt-20">
          <EducationalSection
            thematicExplanation={content.thematicExplanation}
            culturalContext={content.culturalContext}
            genreInsights={content.genreInsights}
            studioComparison={content.studioComparison}
            actorEvolution={content.actorEvolution}
            genreRanking={content.genreRanking}
          />
        </div>

        {/* 14. Contextual Links (SEO Internal Linking) */}
        <div className="mt-8">
          <ContextualLinks links={content.contextualLinks} />
        </div>

        {/* 15. Viewing Tips (Chunk 4) */}
        <div id="viewing-tips" className="scroll-mt-20">
          <ViewingTipsSection
            viewingTips={content.viewingTips}
            bestMoments={content.bestMoments}
            audienceMatch={content.audienceMatch}
            replayValue={content.replayValue}
          />
        </div>

        {/* 16. FAQ Accordion */}
        <div id="faq" className="mt-8 scroll-mt-20">
          <FAQAccordion
            faqItems={content.faqItems}
            technicalFaq={content.technicalFaq}
            videoCode={article.videoCode}
          />
        </div>

        {/* 17. Technical Specs */}
        <div className="mt-8">
          <TechnicalSpecs
            videoQuality={content.videoQuality}
            audioQuality={content.audioQuality}
            subtitleQuality={content.subtitleQuality}
            translationMethod={content.translationMethod}
            translationNote={content.translationNote}
            duration={content.duration}
            readingTime={content.readingTime}
          />
        </div>

        {/* 18. Recommendation */}
        {content.recommendation && (
          <section className="mt-8 rounded-lg border bg-muted/30 p-4">
            <h3 className="mb-2 font-medium">เหมาะสำหรับ</h3>
            <p className="text-sm text-muted-foreground">
              {content.recommendation}
            </p>
            {content.recommendedFor && content.recommendedFor.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {content.recommendedFor.map((item, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}
      </article>
    </PublicLayout>
  );
}
