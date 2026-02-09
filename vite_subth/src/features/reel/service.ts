import { apiClient, type PaginationMeta } from '@/lib/api-client'
import type {
  Reel,
  ReelListParams,
  SyncReelRequest,
  CreateReelRequest,
  UpdateReelRequest,
} from './types'

const REEL_ROUTES = {
  LIST: '/api/v1/reels/manage',
  BY_ID: (id: string) => `/api/v1/reels/manage/${id}`,
  SYNC: '/api/v1/reels/sync',
}

export const reelService = {
  async getList(params?: ReelListParams): Promise<{ data: Reel[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<Reel>(REEL_ROUTES.LIST, { params })
  },

  async getById(id: string): Promise<Reel> {
    return apiClient.get<Reel>(REEL_ROUTES.BY_ID(id))
  },

  async create(payload: CreateReelRequest): Promise<Reel> {
    return apiClient.post<Reel>(REEL_ROUTES.LIST, payload)
  },

  async update(id: string, payload: UpdateReelRequest): Promise<Reel> {
    return apiClient.put<Reel>(REEL_ROUTES.BY_ID(id), payload)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(REEL_ROUTES.BY_ID(id))
  },

  async syncFromSuekk(payload: SyncReelRequest): Promise<Reel> {
    return apiClient.post<Reel>(REEL_ROUTES.SYNC, payload)
  },
}
