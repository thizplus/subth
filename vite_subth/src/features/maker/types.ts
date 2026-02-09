// Maker types ตาม backend response

export interface Maker {
  id: string
  name: string
  slug: string
  videoCount: number
}

export interface MakerDetail extends Maker {
  createdAt: string
}

// Request types
export interface MakerListParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: 'name' | 'video_count' | 'created_at'
  order?: 'asc' | 'desc'
}

export interface CreateMakerPayload {
  name: string
}

export interface UpdateMakerPayload {
  name?: string
}
