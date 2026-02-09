import { apiClient, type PaginationMeta } from '@/lib/api-client'
import { TAG_ROUTES } from '@/constants/api-routes'
import type { Tag, TagDetail, AutoTag, TagListParams, CreateTagPayload, UpdateTagPayload } from './types'

export const tagService = {
  async getList(params?: TagListParams): Promise<{ data: Tag[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<Tag>(TAG_ROUTES.LIST, { params })
  },

  async getById(id: string, lang = 'en'): Promise<TagDetail> {
    return apiClient.get<TagDetail>(TAG_ROUTES.BY_ID(id), { params: { lang } })
  },

  async getBySlug(slug: string, lang = 'en'): Promise<TagDetail> {
    return apiClient.get<TagDetail>(TAG_ROUTES.BY_SLUG(slug), { params: { lang } })
  },

  async search(query: string, lang = 'en', limit = 10): Promise<Tag[]> {
    return apiClient.get<Tag[]>(TAG_ROUTES.SEARCH, { params: { q: query, lang, limit } })
  },

  async getTop(limit = 10, lang = 'en'): Promise<Tag[]> {
    return apiClient.get<Tag[]>(TAG_ROUTES.TOP, { params: { limit, lang } })
  },

  // Auto Tags (AI-generated)
  async getAutoTags(lang = 'en', category?: string): Promise<AutoTag[]> {
    return apiClient.get<AutoTag[]>(TAG_ROUTES.AUTO, { params: { lang, category } })
  },

  async getAutoTagsByKeys(keys: string[], lang = 'en'): Promise<AutoTag[]> {
    return apiClient.get<AutoTag[]>(TAG_ROUTES.AUTO_BY_KEYS, { params: { keys: keys.join(','), lang } })
  },

  // Admin operations
  async create(payload: CreateTagPayload): Promise<TagDetail> {
    return apiClient.post<TagDetail>(TAG_ROUTES.LIST, payload)
  },

  async update(id: string, payload: UpdateTagPayload): Promise<TagDetail> {
    return apiClient.put<TagDetail>(TAG_ROUTES.BY_ID(id), payload)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(TAG_ROUTES.BY_ID(id))
  },
}
