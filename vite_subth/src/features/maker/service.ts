import { apiClient, type PaginationMeta } from '@/lib/api-client'
import { MAKER_ROUTES } from '@/constants/api-routes'
import type { Maker, MakerDetail, MakerListParams, CreateMakerPayload, UpdateMakerPayload } from './types'

export const makerService = {
  async getList(params?: MakerListParams): Promise<{ data: Maker[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<Maker>(MAKER_ROUTES.LIST, { params })
  },

  async getById(id: string): Promise<MakerDetail> {
    return apiClient.get<MakerDetail>(MAKER_ROUTES.BY_ID(id))
  },

  async getBySlug(slug: string): Promise<MakerDetail> {
    return apiClient.get<MakerDetail>(MAKER_ROUTES.BY_SLUG(slug))
  },

  async search(query: string, limit = 10): Promise<Maker[]> {
    return apiClient.get<Maker[]>(MAKER_ROUTES.SEARCH, { params: { q: query, limit } })
  },

  async getTop(limit = 10): Promise<Maker[]> {
    return apiClient.get<Maker[]>(MAKER_ROUTES.TOP, { params: { limit } })
  },

  // Admin operations
  async create(payload: CreateMakerPayload): Promise<MakerDetail> {
    return apiClient.post<MakerDetail>(MAKER_ROUTES.LIST, payload)
  },

  async update(id: string, payload: UpdateMakerPayload): Promise<MakerDetail> {
    return apiClient.put<MakerDetail>(MAKER_ROUTES.BY_ID(id), payload)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(MAKER_ROUTES.BY_ID(id))
  },
}
