export interface Reel {
  id: string
  videoId?: string
  coverUrl: string
  videoUrl: string
  thumbUrl: string
  title: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ReelListParams {
  page?: number
  limit?: number
  active_only?: boolean
}

export interface SyncReelRequest {
  suekkReelId: string
  videoId?: string
  title?: string
  description?: string
}

export interface CreateReelRequest {
  videoId?: string
  coverUrl: string
  videoUrl: string
  thumbUrl: string
  title?: string
  description?: string
  isActive?: boolean
}

export interface UpdateReelRequest {
  videoId?: string
  coverUrl?: string
  videoUrl?: string
  thumbUrl?: string
  title?: string
  description?: string
  isActive?: boolean
}
