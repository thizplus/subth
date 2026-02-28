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
  FAQPageSchema,
  ArticleSchema,
  BreadcrumbSchema,
  ItemListSchema,
  // Deep Analysis Sections
  CharacterJourneySection,
  CinematographySection,
  EducationalSection,
  ViewingTipsSection,
  // Navigation
  ArticleBreadcrumb,
  // Author
  AuthorByline,
  // Trust & E-E-A-T
  TrustBadge,
  RelatedArticles,
  ThematicKeywords,
  // Rating
  StarRating,
  // Article Content & Page
  QuickAnswerBox,
  FeaturedSceneBox,
  ProsCons,
  RelatedSearches,
  FactsTable,
  MidCTA,
  HardCTA,
  ArticleMainContent,
  ArticlePage,
  // Schemas
  VideoObjectSchema,
  JsonLdScripts,
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
  CastProfile,
  MakerInfo,
  TagDescription,
  FAQItem,
  GalleryImage,
  ArticleResponse,
  EmotionalArcPoint,
  ContextualLink,
  KeyMoment,
  RelatedVideo,
  TopQuote,
  ArticleSummary,
  ArticleListParams,
  ArticleListResponse,
} from "./types";
