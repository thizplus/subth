// Article types - aligned with SEO Worker output and gofiber_subth DTOs

// ========================================
// Main Article Types
// ========================================

export interface Article {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: ArticleContent;
  videoCode: string;
  publishedAt: string;
  redirectSlug?: string; // สำหรับ redirect เมื่อ slug ไม่ตรงกับภาษา
}

export interface ArticleContent {
  // === Core SEO ===
  videoId: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;

  // === Schema.org VideoObject ===
  videoName: string;
  videoDescription: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  uploadDate: string;
  duration: string; // ISO 8601 (PT2H2M11S)
  contentUrl: string;
  embedUrl: string;

  // === Key Moments ===
  keyMoments: KeyMoment[];

  // === Article Content ===
  summary: string;
  summaryShort: string;
  highlights: string[];
  detailedReview: string;

  // === Cast & Crew ===
  castProfiles: CastProfile[];
  makerInfo?: MakerInfo;
  previousWorks?: PreviousWork[];

  // === Related Content ===
  relatedVideos?: RelatedVideo[];
  tagDescriptions?: TagDescription[];
  contextualLinks?: ContextualLink[];

  // === [E] Experience Section ===
  sceneLocations?: string[];

  // === [E] Expertise Section ===
  dialogueAnalysis?: string;
  characterInsight?: string;
  topQuotes?: TopQuote[];
  languageNotes?: string;
  actorPerformanceTrend?: string;
  comparisonNote?: string;

  // === [A] Authoritativeness Section ===
  characterDynamic?: string;
  plotAnalysis?: string;
  recommendation?: string;
  recommendedFor?: string[];
  thematicKeywords?: string[];
  settingDescription?: string;
  moodTone?: string[];

  // === [T] Trustworthiness Section ===
  translationMethod?: string;
  translationNote?: string;
  subtitleQuality?: string;
  technicalFaq?: FAQItem[];

  // === Technical Specs ===
  videoQuality?: string;
  audioQuality?: string;

  // === SEO Enhancement ===
  expertAnalysis?: string;
  qualityScore: number;
  keywords?: string[];
  longTailKeywords?: string[];
  readingTime?: number;

  // === Chunk 4: Deep Analysis (SEO Text boost) ===
  // Section 1: Cinematography & Atmosphere
  cinematographyAnalysis?: string;
  visualStyle?: string;
  atmosphereNotes?: string[];

  // Section 2: Character Emotional Journey
  characterJourney?: string;
  emotionalArc?: EmotionalArcPoint[];

  // Section 3: Educational Context
  thematicExplanation?: string;
  culturalContext?: string;
  genreInsights?: string[];

  // Section 4: Comparative Analysis
  studioComparison?: string;
  actorEvolution?: string;
  genreRanking?: string;

  // Section 5: Viewing Experience
  viewingTips?: string;
  bestMoments?: string[];
  audienceMatch?: string;
  replayValue?: string;

  // === TTS ===
  audioSummaryUrl?: string;
  audioDuration?: number;

  // === Gallery ===
  galleryImages?: GalleryImage[];
  memberGalleryImages?: GalleryImage[];
  memberGalleryCount?: number;

  // === FAQ ===
  faqItems: FAQItem[];

  // === Timestamps ===
  createdAt: string;
  updatedAt: string;
}

// ========================================
// Sub-types
// ========================================

export interface KeyMoment {
  name: string;
  startOffset: number; // seconds
  endOffset: number; // seconds
  url: string; // ?t={startOffset}
}

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

export interface PreviousWork {
  videoId: string;
  videoCode: string;
  title: string;
  thumbnailUrl?: string;
}

export interface RelatedVideo {
  id: string;
  code: string;
  title: string;
  thumbnailUrl: string;
  url: string;
  similarity?: number;
}

export interface TagDescription {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface ContextualLink {
  text: string; // ประโยคเชื่อมโยง
  linkedSlug: string; // Slug ของ article ที่ลิงก์ไป
  linkedTitle: string; // Title สำหรับแสดง
  thumbnailUrl?: string; // Thumbnail URL สำหรับแสดงภาพ
  qualityScore?: number; // คะแนนคุณภาพ 1-10
}

export interface TopQuote {
  text: string;
  timestamp: number; // seconds
  emotion: string;
  context: string;
}

export interface EmotionalArcPoint {
  phase: string; // เช่น "เริ่มต้น", "กลางเรื่อง", "ไคลแมกซ์"
  emotion: string; // อารมณ์หลัก
  description: string; // บรรยาย
}

export interface FAQItem {
  question: string;
  answer: string;
}

// ========================================
// V3 Article Content Types (Intent-Driven)
// ========================================

export interface ArticleContentV3 {
  // === Chunk 1: Quick Answer ===
  quickAnswer: string; // 2-3 ประโยค declarative
  mainHook: string; // 1 ประโยค hook
  verdict: string; // 1 ประโยค soft recommendation

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
  synopsis: string; // 150-250 คำ (แบ่ง [PARA])
  storyFlow: string; // 80-100 คำ timeline
  keyScenes: string[]; // 3-5 ฉาก
  featuredScene: string; // 120-150 คำ (ฉากเด่น)
  tone: string; // 2-3 คำ
  relationshipDynamic: string; // 50-80 คำ

  // === Chunk 4: Review ===
  reviewSummary: string; // 200-300 คำ (แบ่ง [PARA])
  strengths: string[]; // 3-5 จุดเด่น
  weaknesses: string[]; // 2-3 จุดอ่อน
  whoShouldWatch: string; // 50-80 คำ
  verdictReason: string; // 30-50 คำ

  // === Chunk 5: FAQ ===
  faqItems: FAQItem[]; // 5 items

  // === Chunk 6: SEO ===
  titleAggressive: string; // Meta title
  titleBalanced: string; // H1
  metaDescription: string;
  slug: string;
  keywords: string[];
  searchIntents: string[]; // 4-5 phrases for internal linking
  rating: number; // 1-5 scale

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

export interface GalleryImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

// ========================================
// API Response Types
// ========================================

export interface ArticleResponse {
  success: boolean;
  data: Article;
}

// V3 Article - matches API response structure
// API returns V3 content in `content` field as flat object
export interface ArticleV3 {
  slug: string;
  language: string;
  type: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  videoCode: string;
  videoId: string;
  publishedAt: string;
  content: ArticleContentV3;
  redirectSlug?: string; // สำหรับ redirect เมื่อ slug ไม่ตรงกับภาษา
}

export interface ArticleV3Response {
  success: boolean;
  data: ArticleV3;
}

// ========================================
// Type Guards
// ========================================

/**
 * Check if article content is V3 format (Intent-Driven)
 * V3 content has: quickAnswer, facts, synopsis, reviewSummary, etc.
 * V2 content has: summary, detailedReview, keyMoments, etc.
 */
export function isV3Content(content: ArticleContent | ArticleContentV3): content is ArticleContentV3 {
  const v3 = content as ArticleContentV3;
  return (
    typeof v3.quickAnswer === "string" &&
    typeof v3.facts === "object" &&
    v3.facts !== null &&
    typeof v3.synopsis === "string" &&
    typeof v3.reviewSummary === "string"
  );
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
  qualityScore?: number; // คะแนน 1-10, หาร 2 ได้ดาว
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
