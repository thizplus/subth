import { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import { PublicLayout } from "@/components/layout/server";
import {
  getArticleByTypeAndSlug,
  // Above-fold components (critical path)
  AudioPlayer,
  ThumbnailWithCTA,
  ThumbnailImage,
  EntityContext,
  KeyMomentsPreview,
  CastCard,
  MakerCard,
  TagsList,
  TableOfContents,
  ArticleBreadcrumb,
  AuthorByline,
  TrustBadge,
  StarRating,
  // Schema components (JSON-LD, no JS impact)
  VideoObjectSchema,
  FAQPageSchema,
  ArticleSchema,
  BreadcrumbSchema,
  // V3 Components
  ArticlePageV3,
  isV3Content,
} from "@/features/article";

// Below-fold components - dynamic import with SSR for SEO
const CharacterJourneySection = dynamic(
  () => import("@/features/article/components/character-journey-section").then((m) => m.CharacterJourneySection),
  { ssr: true }
);
const ExpertBox = dynamic(
  () => import("@/features/article/components/expert-box").then((m) => m.ExpertBox),
  { ssr: true }
);
const CinematographySection = dynamic(
  () => import("@/features/article/components/cinematography-section").then((m) => m.CinematographySection),
  { ssr: true }
);
const GallerySection = dynamic(
  () => import("@/features/article/components/gallery-section").then((m) => m.GallerySection),
  { ssr: true }
);
const InlineGallery = dynamic(
  () => import("@/features/article/components/inline-gallery").then((m) => m.InlineGallery),
  { ssr: true }
);
const QuoteCard = dynamic(
  () => import("@/features/article/components/quote-card").then((m) => m.QuoteCard),
  { ssr: true }
);
const EducationalSection = dynamic(
  () => import("@/features/article/components/educational-section").then((m) => m.EducationalSection),
  { ssr: true }
);
const ContextualLinks = dynamic(
  () => import("@/features/article/components/contextual-links").then((m) => m.ContextualLinks),
  { ssr: true }
);
const ViewingTipsSection = dynamic(
  () => import("@/features/article/components/viewing-tips-section").then((m) => m.ViewingTipsSection),
  { ssr: true }
);
const FAQAccordion = dynamic(
  () => import("@/features/article/components/faq-accordion").then((m) => m.FAQAccordion),
  { ssr: true }
);
const ThematicKeywords = dynamic(
  () => import("@/features/article/components/thematic-keywords").then((m) => m.ThematicKeywords),
  { ssr: true }
);
const TechnicalSpecs = dynamic(
  () => import("@/features/article/components/technical-specs").then((m) => m.TechnicalSpecs),
  { ssr: true }
);
const RelatedArticles = dynamic(
  () => import("@/features/article/components/related-articles").then((m) => m.RelatedArticles),
  { ssr: true }
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await getArticleByTypeAndSlug("review", slug, "en");

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
        canonical: `https://subth.com/en/articles/review/${slug}`,
        languages: {
          th: `https://subth.com/articles/review/${slug}`,
          en: `https://subth.com/en/articles/review/${slug}`,
        },
      },
    };
  } catch {
    return {
      title: "Article Not Found | SubTH",
    };
  }
}

export default async function ReviewArticlePageEN({ params }: PageProps) {
  const { slug } = await params;

  let article;
  try {
    article = await getArticleByTypeAndSlug("review", slug, "en");
  } catch {
    notFound();
  }

  // Redirect ไปยัง slug ที่ถูกต้องถ้าภาษาไม่ตรง
  if (article.redirectSlug) {
    redirect(`/en/articles/review/${article.redirectSlug}`);
  }

  const { content } = article;

  // V3 Content Detection - use V3 layout if content has V3 structure
  if (isV3Content(content)) {
    return <ArticlePageV3 article={article as any} locale="en" />;
  }

  // V2 Layout (legacy)
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
        type="review"
        videoId={content.videoId}
        locale="en"
      />
      <BreadcrumbSchema title={article.title} slug={article.slug} type="review" locale="en" />

      <article className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <ArticleBreadcrumb
          items={[
            { label: "Articles", href: "/en/articles" },
            { label: "Reviews", href: "/en/articles?type=review" },
            { label: article.title },
          ]}
          
        />

        <ThumbnailWithCTA videoId={content.videoId}>
          <ThumbnailImage
            src={content.thumbnailUrl}
            alt={content.thumbnailAlt || article.title}
          />
        </ThumbnailWithCTA>

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

        {content.qualityScore && (
          <div className="mt-2">
            <StarRating score={content.qualityScore} size="md" />
          </div>
        )}

        <div className="mt-3">
          <AuthorByline
            publishedAt={article.publishedAt}
            updatedAt={content.updatedAt}
            
          />
        </div>

        <div className="mt-3">
          <TrustBadge updatedAt={content.updatedAt} />
        </div>

        <div className="mt-6 space-y-4 rounded-xl border bg-gradient-to-b from-muted/30 to-transparent p-4">
          <div className="flex flex-wrap gap-6">
            <CastCard casts={content.castProfiles} />
            <MakerCard maker={content.makerInfo} />
          </div>
          <TagsList tags={content.tagDescriptions} />
          {/* Entity Reinforcement Block - Knowledge Graph mapping */}
          <EntityContext
            code={article.videoCode}
            studio={content.makerInfo?.name}
            leadCast={content.castProfiles?.[0]?.name}
            genre={content.tagDescriptions?.[0]?.name}
          />
        </div>

        <section id="summary" className="mt-8 scroll-mt-20">
          <h2 className="mb-4 text-xl font-semibold">Summary</h2>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            {content.summary.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {/* Story images - images 1-2 */}
          {content.galleryImages && content.galleryImages.length > 0 && (
            <InlineGallery
              images={content.galleryImages.slice(0, 2)}
              videoCode={article.videoCode}
              columns={2}
              caption="Scenes from the story"
            />
          )}
        </section>

        <div id="character-journey" className="scroll-mt-20">
          <CharacterJourneySection
            characterJourney={content.characterJourney}
            emotionalArc={content.emotionalArc}
          />
          {/* Character images - images 3-4 */}
          {content.galleryImages && content.galleryImages.length > 2 && (
            <InlineGallery
              images={content.galleryImages.slice(2, 4)}
              videoCode={article.videoCode}
              columns={2}
              caption="Character scenes"
            />
          )}
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
          {/* Featured scenes - images 5-6 */}
          {content.galleryImages && content.galleryImages.length > 4 && (
            <InlineGallery
              images={content.galleryImages.slice(4, 6)}
              videoCode={article.videoCode}
              columns={2}
              caption="Featured scenes"
            />
          )}
        </div>

        {/* Gallery - show remaining images (7+) */}
        {content.galleryImages && content.galleryImages.length > 6 && (
          <div id="gallery" className="mt-8 scroll-mt-20">
            <GallerySection
              images={content.galleryImages.slice(6)}
              memberCount={content.memberGalleryCount}
              videoId={content.videoId}
              videoCode={article.videoCode}
            />
          </div>
        )}

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

        <ThematicKeywords
          keywords={content.thematicKeywords || []}
          
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

        <RelatedArticles
          articles={content.relatedVideos || []}
          
        />
      </article>
    </PublicLayout>
  );
}
