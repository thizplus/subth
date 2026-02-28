// Components
export {
  ArticleCard,
  AudioPlayer,
  ThumbnailWithCTA,
  ThumbnailImage,
  EntityContext,
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
  ItemListSchema,
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
  // Trust & E-E-A-T
  TrustBadge,
  RelatedArticles,
  ThematicKeywords,
  // Rating
  StarRating,
} from "./components";

// Service
export { articleService } from "./service";

// Cached Service (for RSC deduplication)
export { getArticleByTypeAndSlug } from "./cached-service";

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
