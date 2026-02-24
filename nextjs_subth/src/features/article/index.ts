// Components
export {
  ArticleCard,
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
} from "./components";

// Service
export { articleService } from "./service";

// Hooks (client-side)
export { useKeyMomentClick, useLoginRedirect } from "./hooks";

// Utils (can be used on both server and client)
export { formatTimestamp, parseDuration, formatDuration } from "./utils";

// Types
export type {
  Article,
  ArticleContent,
  KeyMoment,
  CastProfile,
  MakerInfo,
  PreviousWork,
  RelatedVideo,
  TagDescription,
  ContextualLink,
  TopQuote,
  FAQItem,
  GalleryImage,
  ArticleResponse,
  EmotionalArcPoint,
  // List types
  ArticleSummary,
  ArticleListParams,
  ArticleListResponse,
} from "./types";
