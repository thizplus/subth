// Video types ตาม backend response
import type { Maker } from '@/features/maker'
import type { Cast } from '@/features/cast'
import type { Tag, AutoTag } from '@/features/tag'
import type { Category } from '@/features/category'

export interface Video {
  id: string
  title: string
  titleTh?: string // ชื่อไทย (ถ้ามี)
  titleEn?: string // ชื่อ EN (ถ้ามี)
  thumbnail?: string
  categories?: string[] // Category slugs (multi-category)
  releaseDate?: string
  maker?: string // maker name for list view
  casts?: { name: string }[]
}

export interface VideoDetail {
  id: string
  title: string
  thumbnail?: string
  categories?: Category[] // Multi-category support
  releaseDate?: string
  translations?: Record<string, string> // { "en": "...", "th": "...", "ja": "..." }
  embedUrl?: string
  maker?: Maker | string
  casts?: Cast[]
  tags?: Tag[]
  autoTags?: AutoTag[]
  createdAt: string
  updatedAt: string
}

// Request types
export interface VideoListParams {
  page?: number
  limit?: number
  lang?: 'en' | 'th' | 'ja'
  search?: string
  maker_id?: string
  cast_id?: string
  tag_id?: string
  auto_tags?: string // comma separated
  category?: string
  sort_by?: 'date' | 'created_at'
  order?: 'asc' | 'desc'
}

export interface CreateVideoPayload {
  thumbnail?: string
  embed_url?: string
  categories?: string[] // Category slugs (multi-category)
  release_date?: string
  maker?: string // maker name
  cast?: string[] // cast names
  tags?: string[] // tag names
  titles?: Record<string, string> // { "en": "...", "th": "..." }
}

export interface UpdateVideoPayload {
  thumbnail?: string
  embed_url?: string
  categories?: string[] // Category slugs (multi-category)
  release_date?: string
  maker?: string
  cast?: string[]
  tags?: string[]
  titles?: Record<string, string>
}

export interface BatchCreateVideoPayload {
  videos: CreateVideoPayload[]
}

export interface BatchCreateResult {
  total: number
  succeeded: number
  failed: number
  results: {
    index: number
    success: boolean
    video_id?: string
    error?: string
  }[]
}
