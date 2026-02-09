import { apiClient } from '@/lib/api-client'
import { CATEGORY_ROUTES } from '@/constants/api-routes'
import type { Category, CategoryDetail, CategoryListParams, CreateCategoryPayload, UpdateCategoryPayload } from './types'

export const categoryService = {
  // Category ใช้ List แบบไม่มี pagination (ไม่เยอะ)
  async getList(params?: CategoryListParams): Promise<Category[]> {
    return apiClient.get<Category[]>(CATEGORY_ROUTES.LIST, { params })
  },

  async getById(id: string, lang = 'en'): Promise<CategoryDetail> {
    return apiClient.get<CategoryDetail>(CATEGORY_ROUTES.BY_ID(id), { params: { lang } })
  },

  // Admin operations
  async create(payload: CreateCategoryPayload): Promise<CategoryDetail> {
    return apiClient.post<CategoryDetail>(CATEGORY_ROUTES.LIST, payload)
  },

  async update(id: string, payload: UpdateCategoryPayload): Promise<CategoryDetail> {
    return apiClient.put<CategoryDetail>(CATEGORY_ROUTES.BY_ID(id), payload)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(CATEGORY_ROUTES.BY_ID(id))
  },
}
