// Category types ตาม backend response

export interface Category {
  id: string
  name: string // แปลตาม lang
  slug: string
  videoCount: number
}

export interface CategoryDetail extends Category {
  translations?: Record<string, string> // { "th": "...", "ja": "..." }
}

// Request types
export interface CategoryListParams {
  lang?: 'en' | 'th' | 'ja'
}

export interface CreateCategoryPayload {
  name: string
  translations?: Record<string, string>
}

export interface UpdateCategoryPayload {
  name?: string
  translations?: Record<string, string>
}
