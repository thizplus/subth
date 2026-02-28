"use client";

import dynamic from "next/dynamic";
import { QuickAnswerBox } from "./quick-answer-box";
import { FactsTable } from "./facts-table";
import { FeaturedSceneBox } from "./featured-scene-box";
import { ProsCons } from "./pros-cons";
import { RelatedSearches } from "./related-searches";
import { MidCTA } from "./mid-cta";
import { HardCTA } from "./hard-cta";
import { useDictionary } from "@/components/dictionary-provider";
import type { ArticleContent } from "../types";

// Dynamic imports for below-fold components
const FAQAccordion = dynamic(
  () => import("./faq-accordion").then((m) => m.FAQAccordion),
  { ssr: true }
);
const GallerySection = dynamic(
  () => import("./gallery-section").then((m) => m.GallerySection),
  { ssr: true }
);
const RelatedArticles = dynamic(
  () => import("./related-articles").then((m) => m.RelatedArticles),
  { ssr: true }
);

interface ArticleMainContentProps {
  content: ArticleContent;
  videoCode: string;
  videoId: string;
}

export function ArticleMainContent({
  content,
  videoCode,
  videoId,
}: ArticleMainContentProps) {
  const { t } = useDictionary();

  // Calculate word count for MidCTA display
  const wordCount =
    (content.synopsis?.length || 0) +
    (content.reviewSummary?.length || 0) +
    (content.featuredScene?.length || 0);
  const showMidCTA = wordCount >= 1200;

  // Parse synopsis paragraphs (split by [PARA])
  const synopsisParagraphs = content.synopsis
    ?.split("[PARA]")
    .map((p) => p.trim())
    .filter(Boolean) || [];

  // Parse reviewSummary paragraphs
  const reviewParagraphs = content.reviewSummary
    ?.split("[PARA]")
    .map((p) => p.trim())
    .filter(Boolean) || [];

  return (
    <div className="space-y-8">
      {/* Quick Answer Box - Above the fold */}
      <QuickAnswerBox
        quickAnswer={content.quickAnswer}
        verdict={content.verdict}
        rating={content.rating}
      />

      {/* Facts Table with Schema.org markup */}
      <FactsTable
        code={content.facts.code}
        studio={content.facts.studio}
        cast={content.facts.cast}
        duration={content.facts.duration}
        durationMinutes={content.facts.durationMinutes}
        genre={content.facts.genre}
        releaseYear={content.facts.releaseYear}
        subtitleAvailable={content.facts.subtitleAvailable}
        castProfiles={content.castProfiles}
        makerInfo={content.makerInfo}
      />

      {/* Story Recap Section */}
      <section id="story" className="scroll-mt-20">
        <h2 className="mb-4 text-xl font-semibold">{t("article.storyRecap")}</h2>

        {/* Synopsis */}
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          {synopsisParagraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Story Flow - Timeline */}
        {content.storyFlow && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border-l-2 border-muted-foreground/30">
            <p className="text-sm text-muted-foreground italic">
              {content.storyFlow}
            </p>
          </div>
        )}

        {/* Key Scenes */}
        {content.keyScenes && content.keyScenes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">{t("article.keyMoments")}</h3>
            <ol className="space-y-2 list-decimal list-inside">
              {content.keyScenes.map((scene, i) => (
                <li key={i} className="text-muted-foreground">
                  {scene}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Featured Scene - Scroll Depth Trigger */}
        <FeaturedSceneBox featuredScene={content.featuredScene} />

        {/* Tone & Relationship */}
        {(content.tone || content.relationshipDynamic) && (
          <div className="mt-4 flex flex-wrap gap-4">
            {content.tone && (
              <div className="px-3 py-1.5 bg-muted rounded-lg text-sm">
                <span className="text-muted-foreground">{t("article.tone")}: </span>
                <span className="font-medium">{content.tone}</span>
              </div>
            )}
          </div>
        )}

        {content.relationshipDynamic && (
          <p className="mt-4 text-sm text-muted-foreground italic">
            {content.relationshipDynamic}
          </p>
        )}
      </section>

      {/* Mid CTA - Show if wordCount >= 1200 */}
      {showMidCTA && <MidCTA videoId={videoId} />}

      {/* Review Section */}
      <section id="review" className="scroll-mt-20">
        <h2 className="mb-4 text-xl font-semibold">{t("article.reviewSection")}</h2>

        {/* Review Summary */}
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          {reviewParagraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Pros/Cons Grid */}
        <ProsCons
          strengths={content.strengths}
          weaknesses={content.weaknesses}
        />

        {/* Who Should Watch */}
        {content.whoShouldWatch && (
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
            <h3 className="font-medium mb-2">{t("article.whoShouldWatch")}</h3>
            <p className="text-muted-foreground">{content.whoShouldWatch}</p>
          </div>
        )}

        {/* Verdict Reason */}
        {content.verdictReason && (
          <p className="mt-4 text-sm text-muted-foreground italic border-l-2 border-primary pl-4">
            {content.verdictReason}
          </p>
        )}
      </section>

      {/* Gallery */}
      {content.galleryImages && content.galleryImages.length > 0 && (
        <div id="gallery" className="scroll-mt-20">
          <GallerySection
            images={content.galleryImages}
            memberCount={content.memberGalleryCount}
            videoId={videoId}
            videoCode={videoCode}
          />
        </div>
      )}

      {/* FAQ Section */}
      {content.faqItems && content.faqItems.length > 0 && (
        <div id="faq" className="scroll-mt-20">
          <FAQAccordion
            faqItems={content.faqItems}
            videoCode={videoCode}
          />
        </div>
      )}

      {/* Related Searches - Internal Linking */}
      <RelatedSearches
        searchIntents={content.searchIntents}
        tags={content.tagDescriptions}
        casts={content.castProfiles}
        maker={content.makerInfo}
      />

      {/* Hard CTA - End of article */}
      <HardCTA videoId={videoId} />
    </div>
  );
}
