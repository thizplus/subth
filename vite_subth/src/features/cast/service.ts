import { apiClient, type PaginationMeta } from '@/lib/api-client'
import { CAST_ROUTES } from '@/constants/api-routes'
import type { Cast, CastDetail, CastListParams, CreateCastPayload, UpdateCastPayload } from './types'

export const castService = {
  async getList(params?: CastListParams): Promise<{ data: Cast[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<Cast>(CAST_ROUTES.LIST, { params })
  },

  async getById(id: string, lang = 'en'): Promise<CastDetail> {
    return apiClient.get<CastDetail>(CAST_ROUTES.BY_ID(id), { params: { lang } })
  },

  async getBySlug(slug: string, lang = 'en'): Promise<CastDetail> {
    return apiClient.get<CastDetail>(CAST_ROUTES.BY_SLUG(slug), { params: { lang } })
  },

  async search(query: string, lang = 'en', limit = 10): Promise<Cast[]> {
    return apiClient.get<Cast[]>(CAST_ROUTES.SEARCH, { params: { q: query, lang, limit } })
  },

  async getTop(limit = 10, lang = 'en'): Promise<Cast[]> {
    return apiClient.get<Cast[]>(CAST_ROUTES.TOP, { params: { limit, lang } })
  },

  // Admin operations
  async create(payload: CreateCastPayload): Promise<CastDetail> {
    return apiClient.post<CastDetail>(CAST_ROUTES.LIST, payload)
  },

  async update(id: string, payload: UpdateCastPayload): Promise<CastDetail> {
    return apiClient.put<CastDetail>(CAST_ROUTES.BY_ID(id), payload)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(CAST_ROUTES.BY_ID(id))
  },
}
