// Tag types ตาม backend response

export interface Tag {
  id: string
  name: string // แปลตาม lang
  slug: string
  videoCount: number
}

export interface TagDetail extends Tag {
  translations?: Record<string, string> // { "th": "...", "ja": "..." }
  createdAt: string
}

export interface AutoTag {
  key: string
  name: string // แปลตาม lang
  category: string
}

// Request types
export interface TagListParams {
  page?: number
  limit?: number
  lang?: 'en' | 'th' | 'ja'
  search?: string
  sort_by?: 'name' | 'video_count' | 'created_at'
  order?: 'asc' | 'desc'
}

export interface CreateTagPayload {
  name: string
  translations?: Record<string, string>
}

export interface UpdateTagPayload {
  name?: string
  translations?: Record<string, string>
}
