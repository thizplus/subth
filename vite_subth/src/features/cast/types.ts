// Cast types ตาม backend response

export interface Cast {
  id: string
  name: string // แปลตาม lang
  slug: string
  videoCount: number
}

export interface CastDetail extends Cast {
  translations?: Record<string, string> // { "th": "...", "ja": "..." }
  createdAt: string
}

// Request types
export interface CastListParams {
  page?: number
  limit?: number
  lang?: 'en' | 'th' | 'ja'
  search?: string
  sort_by?: 'name' | 'video_count' | 'created_at'
  order?: 'asc' | 'desc'
}

export interface CreateCastPayload {
  name: string
  translations?: Record<string, string>
}

export interface UpdateCastPayload {
  name?: string
  translations?: Record<string, string>
}
