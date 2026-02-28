// Article types - Intent-Driven Architecture

// ========================================
// Main Article Types
// ========================================

export interface Article {
  slug: string;
  language: string;
  type: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  videoCode: string;
  videoId: string;
  publishedAt: string;
  content: ArticleContent;
  translations?: Record<string, string>; // {"en": "slug-en", "th": "slug-th"}
  redirectSlug?: string; // สำหรับ redirect เมื่อ slug ไม่ตรงกับภาษา (fallback)
}

export interface ArticleContent {
  // === Chunk 1: Quick Answer ===
  quickAnswer: string;
  mainHook: string;
  verdict: string;

  // === Chunk 2: Facts ===
  facts: {
    code: string;
    studio: string;
    cast: string[];
    duration: string;
    durationMinutes: number;
    genre: string[];
    releaseYear: string;
    subtitleAvailable: boolean;
  };

  // === Chunk 3: Story ===
  synopsis: string;
  storyFlow: string;
  keyScenes: string[];
  featuredScene: string;
  tone: string;
  relationshipDynamic: string;

  // === Chunk 4: Review ===
  reviewSummary: string;
  strengths: string[];
  weaknesses: string[];
  whoShouldWatch: string;
  verdictReason: string;

  // === Chunk 5: FAQ ===
  faqItems: FAQItem[];

  // === Chunk 6: SEO ===
  titleAggressive: string;
  titleBalanced: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  searchIntents: string[];
  rating: number;

  // === Metadata (from API) ===
  castProfiles?: CastProfile[];
  makerInfo?: MakerInfo;
  tagDescriptions?: TagDescription[];
  galleryImages?: GalleryImage[];
  memberGalleryImages?: GalleryImage[];
  memberGalleryCount?: number;
  thumbnailUrl: string;

  // === Timestamps ===
  createdAt: string;
  updatedAt: string;
}

// ========================================
// Sub-types
// ========================================

export interface CastProfile {
  id: string;
  name: string;
  nameTH?: string;
  bio: string;
  imageUrl?: string;
  profileUrl: string;
}

export interface MakerInfo {
  id: string;
  name: string;
  description?: string;
  profileUrl: string;
}

export interface TagDescription {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GalleryImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

// Legacy types for V2 components (still exported for backward compatibility)
export interface EmotionalArcPoint {
  phase: string;
  emotion: string;
  description: string;
}

export interface ContextualLink {
  linkedSlug: string;
  linkedTitle: string;
  text: string;
  thumbnailUrl?: string;
  rating?: number; // 1-5 scale
}

export interface KeyMoment {
  name: string;
  startOffset: number;
  endOffset: number;
}

export interface RelatedVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  code: string;
  url: string;
}

export interface TopQuote {
  text: string;
  timestamp: number;
  emotion?: string;
  context?: string;
}

// ========================================
// API Response Types
// ========================================

export interface ArticleResponse {
  success: boolean;
  data: Article;
}

// ========================================
// List Types (for listing pages)
// ========================================

export interface ArticleSummary {
  slug: string;
  title: string;
  metaDescription: string;
  thumbnailUrl: string;
  videoCode: string;
  publishedAt: string;
  castNames?: string[];
  makerName?: string;
  tags?: string[];
  rating?: number; // 1-5 scale
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  lang?: string;
  search?: string;
  sort?: "published_at" | "updated_at";
  order?: "asc" | "desc";
}

export interface ArticleListResponse {
  success: boolean;
  data: ArticleSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
