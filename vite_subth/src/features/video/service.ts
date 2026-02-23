import { apiClient, type PaginationMeta } from '@/lib/api-client'
import { VIDEO_ROUTES } from '@/constants/api-routes'
import type {
  Video,
  VideoDetail,
  VideoListParams,
  CreateVideoPayload,
  UpdateVideoPayload,
  BatchCreateVideoPayload,
  BatchCreateResult,
} from './types'

export const videoService = {
  async getList(params?: VideoListParams): Promise<{ data: Video[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<Video>(VIDEO_ROUTES.LIST, { params })
  },

  async getById(id: string, lang = 'en'): Promise<VideoDetail> {
    return apiClient.get<VideoDetail>(VIDEO_ROUTES.BY_ID(id), { params: { lang } })
  },

  async search(query: string, params?: Omit<VideoListParams, 'search'>): Promise<{ data: Video[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<Video>(VIDEO_ROUTES.SEARCH, { params: { ...params, q: query } })
  },

  async getRandom(limit = 10, lang = 'en'): Promise<Video[]> {
    return apiClient.get<Video[]>(VIDEO_ROUTES.RANDOM, { params: { limit, lang } })
  },

  async getByMaker(makerId: string, params?: VideoListParams): Promise<{ data: Video[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<Video>(VIDEO_ROUTES.BY_MAKER(makerId), { params })
  },

  async getByCast(castId: string, params?: VideoListParams): Promise<{ data: Video[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<Video>(VIDEO_ROUTES.BY_CAST(castId), { params })
  },

  async getByTag(tagId: string, params?: VideoListParams): Promise<{ data: Video[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<Video>(VIDEO_ROUTES.BY_TAG(tagId), { params })
  },

  // Admin operations
  async create(payload: CreateVideoPayload): Promise<VideoDetail> {
    return apiClient.post<VideoDetail>(VIDEO_ROUTES.LIST, payload)
  },

  async createBatch(payload: BatchCreateVideoPayload): Promise<BatchCreateResult> {
    return apiClient.post<BatchCreateResult>(VIDEO_ROUTES.BATCH, payload)
  },

  async update(id: string, payload: UpdateVideoPayload): Promise<VideoDetail> {
    return apiClient.put<VideoDetail>(VIDEO_ROUTES.BY_ID(id), payload)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(VIDEO_ROUTES.BY_ID(id))
  },

  async regenerateGallery(id: string): Promise<{ message: string; video_id: string; video_code: string }> {
    return apiClient.post(VIDEO_ROUTES.REGENERATE_GALLERY(id))
  },
}
