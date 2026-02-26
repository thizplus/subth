import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/server";
import {
  articleService,
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
  AggregateRatingSchema,
  CharacterJourneySection,
  CinematographySection,
  EducationalSection,
  ViewingTipsSection,
  TableOfContents,
  AudioPlayer,
  ArticleBreadcrumb,
  AuthorByline,
  TrustBadge,
  RelatedArticles,
  ThematicKeywords,
  HowToSchema,
  StarRating,
} from "@/features/article";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await articleService.getBySlug(slug, "en");

    return {
      title: article.metaTitle,
      description: article.metaDescription,
      openGraph: {
        type: "article",
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
        locale: "en_US",
        publishedTime: article.publishedAt,
        modifiedTime: article.content.updatedAt,
        authors: ["SubTH Editorial"],
      },
      twitter: {
        card: "summary_large_image",
        title: article.metaTitle,
        description: article.metaDescription,
        images: [article.content.thumbnailUrl],
      },
      alternates: {
        canonical: `https://subth.com/en/articles/${slug}`,
        languages: {
          "th": `https://subth.com/articles/${slug}`,
          "en": `https://subth.com/en/articles/${slug}`,
        },
      },
    };
  } catch {
    return {
      title: "Article Not Found | SubTH",
    };
  }
}

export default async function ArticlePageEN({ params }: PageProps) {
  const { slug } = await params;

  let article;
  try {
    article = await articleService.getBySlug(slug, "en");
  } catch {
    notFound();
  }

  const { content } = article;

  return (
    <PublicLayout locale="en">
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
        locale="en"
      />
      <BreadcrumbSchema title={article.title} slug={article.slug} />
      {/* AggregateRating Schema for Google Rich Snippets */}
      {content.qualityScore && (
        <AggregateRatingSchema
          title={article.title}
          description={article.metaDescription}
          thumbnailUrl={content.thumbnailUrl}
          slug={article.slug}
          qualityScore={content.qualityScore}
          locale="en"
        />
      )}
      {/* HowTo Schema for Viewing Tips */}
      {content.viewingTips && (
        <HowToSchema
          title={`How to Watch ${article.title}`}
          description={`Tips for watching ${article.videoCode} for the best experience`}
          tips={content.viewingTips}
          videoCode={article.videoCode}
          locale="en"
        />
      )}

      <article className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <ArticleBreadcrumb
          items={[
            { label: "Articles", href: "/en/articles" },
            { label: article.title },
          ]}
          locale="en"
        />

        <ThumbnailWithCTA
          thumbnailUrl={content.thumbnailUrl}
          thumbnailAlt={content.thumbnailAlt}
          videoId={content.videoId}
          title={article.title}
        />

        {content.summaryShort && (
          <p className="mt-4 text-lg text-muted-foreground">
            {content.summaryShort}
          </p>
        )}

        <AudioPlayer
          audioUrl={content.audioSummaryUrl}
          audioDuration={content.audioDuration}
          title="Listen to Summary"
        />

        <TableOfContents content={content} />

        <div className="mt-6">
          <KeyMomentsPreview
            keyMoments={content.keyMoments}
            duration={content.duration}
            videoId={content.videoId}
          />
        </div>

        <h1 className="mt-8 text-2xl font-bold md:text-3xl">{article.title}</h1>

        {/* Quality Score */}
        {content.qualityScore && (
          <div className="mt-2">
            <StarRating score={content.qualityScore} size="md" />
          </div>
        )}

        {/* Author Byline */}
        <div className="mt-3">
          <AuthorByline
            publishedAt={article.publishedAt}
            updatedAt={content.updatedAt}
            locale="en"
          />
        </div>

        {/* Trust Badge */}
        <div className="mt-3">
          <TrustBadge updatedAt={content.updatedAt} locale="en" />
        </div>

        <div className="mt-6 space-y-4 rounded-xl border bg-gradient-to-b from-muted/30 to-transparent p-4">
          <div className="flex flex-wrap gap-6">
            <CastCard casts={content.castProfiles} />
            <MakerCard maker={content.makerInfo} />
          </div>
          <TagsList tags={content.tagDescriptions} />
        </div>

        <section id="summary" className="mt-8 scroll-mt-20">
          <h2 className="mb-4 text-xl font-semibold">Summary</h2>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            {content.summary.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>

        <div id="character-journey" className="scroll-mt-20">
          <CharacterJourneySection
            characterJourney={content.characterJourney}
            emotionalArc={content.emotionalArc}
          />
        </div>

        <div className="mt-8">
          <ExpertBox
            expertAnalysis={content.expertAnalysis}
            dialogueAnalysis={content.dialogueAnalysis}
            characterInsight={content.characterInsight}
          />
        </div>

        <div id="cinematography" className="scroll-mt-20">
          <CinematographySection
            cinematographyAnalysis={content.cinematographyAnalysis}
            visualStyle={content.visualStyle}
            atmosphereNotes={content.atmosphereNotes}
          />
        </div>

        <div id="gallery" className="mt-8 scroll-mt-20">
          <GallerySection
            images={content.galleryImages || []}
            memberCount={content.memberGalleryCount}
            videoId={content.videoId}
            videoCode={article.videoCode}
          />
        </div>

        <div className="mt-8">
          <QuoteCard
            quotes={content.topQuotes || []}
            videoId={content.videoId}
          />
        </div>

        {content.detailedReview && (
          <section id="review" className="mt-8 scroll-mt-20">
            <h2 className="mb-4 text-xl font-semibold">Detailed Review</h2>
            <div className="space-y-4 leading-relaxed text-muted-foreground">
              {content.detailedReview.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

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

        <div className="mt-8">
          <ContextualLinks links={content.contextualLinks} />
        </div>

        <div id="viewing-tips" className="scroll-mt-20">
          <ViewingTipsSection
            viewingTips={content.viewingTips}
            bestMoments={content.bestMoments}
            audienceMatch={content.audienceMatch}
            replayValue={content.replayValue}
          />
        </div>

        <div id="faq" className="mt-8 scroll-mt-20">
          <FAQAccordion
            faqItems={content.faqItems}
            technicalFaq={content.technicalFaq}
            videoCode={article.videoCode}
          />
        </div>

        {/* Thematic Keywords */}
        <ThematicKeywords
          keywords={content.thematicKeywords || []}
          locale="en"
        />

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

        {content.recommendation && (
          <section className="mt-8 rounded-lg border bg-muted/30 p-4">
            <h3 className="mb-2 font-medium">Recommended For</h3>
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

        {/* Related Articles */}
        <RelatedArticles
          articles={content.relatedVideos || []}
          locale="en"
        />
      </article>
    </PublicLayout>
  );
}
