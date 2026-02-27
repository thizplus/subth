// Article types ตาม backend response

export type ArticleType = 'review' | 'ranking' | 'best-of' | 'guide' | 'news'
export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived'
export type IndexingStatus = 'pending' | 'indexed' | 'failed'

export interface ArticleListItem {
  id: string
  videoId: string
  videoCode: string
  videoThumbnail?: string
  type: ArticleType
  slug: string
  title: string
  status: ArticleStatus
  indexingStatus: IndexingStatus
  qualityScore: number
  readingTime: number
  scheduledAt?: string
  publishedAt?: string
  createdAt: string
}

export interface ArticleDetail {
  id: string
  videoId: string
  videoCode: string
  type: ArticleType
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  content: ArticleContent
  status: ArticleStatus
  indexingStatus: IndexingStatus
  qualityScore: number
  readingTime: number
  scheduledAt?: string
  publishedAt?: string
  indexedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ArticleContent {
  videoID: string
  title: string
  metaTitle: string
  metaDescription: string
  slug: string
  thumbnailURL?: string
  thumbnailAlt?: string
  summary?: string
  highlights?: string[]
  detailedReview?: string
  castProfiles?: CastProfile[]
  makerInfo?: MakerInfo
  tagDescriptions?: TagDescription[]
  keyMoments?: KeyMoment[]
  faqItems?: FAQItem[]
  galleryImages?: GalleryImage[]
  qualityScore?: number
  readingTime?: number

  // === Chunk 4: Deep Analysis (SEO Text boost) ===
  cinematographyAnalysis?: string
  visualStyle?: string
  atmosphereNotes?: string[]
  characterJourney?: string
  emotionalArc?: EmotionalArcPoint[]
  thematicExplanation?: string
  culturalContext?: string
  genreInsights?: string[]
  studioComparison?: string
  actorEvolution?: string
  genreRanking?: string
  viewingTips?: string
  bestMoments?: string[]
  audienceMatch?: string
  replayValue?: string
}

export interface CastProfile {
  name: string
  description?: string
  imageURL?: string
}

export interface MakerInfo {
  name: string
  description?: string
}

export interface TagDescription {
  name: string
  description?: string
}

export interface KeyMoment {
  timestamp?: string
  description: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface GalleryImage {
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface EmotionalArcPoint {
  phase: string
  emotion: string
  description: string
}

// Request types
export interface ArticleListParams {
  page?: number
  limit?: number
  type?: ArticleType
  status?: ArticleStatus
  indexing_status?: IndexingStatus
  search?: string
  sort_by?: 'created_at' | 'published_at' | 'quality_score'
  order?: 'asc' | 'desc'
}

export interface UpdateArticleStatusRequest {
  status: ArticleStatus
  scheduledAt?: string
}

export interface BulkScheduleRequest {
  articleIds: string[]
  scheduledAt: string
  interval?: number // minutes between each article
}

// Stats
export interface ArticleStats {
  totalArticles: number
  draftCount: number
  scheduledCount: number
  publishedCount: number
  indexedCount: number
  pendingIndex: number
  failedIndex: number
}
