import { apiClient, type PaginationMeta } from '@/lib/api-client'
import { ARTICLE_ROUTES } from '@/constants/api-routes'
import type {
  ArticleListItem,
  ArticleDetail,
  ArticleListParams,
  UpdateArticleStatusRequest,
  BulkScheduleRequest,
  ArticleStats,
} from './types'

export const articleService = {
  async getList(params?: ArticleListParams): Promise<{ data: ArticleListItem[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<ArticleListItem>(ARTICLE_ROUTES.LIST, { params })
  },

  async getById(id: string): Promise<ArticleDetail> {
    return apiClient.get<ArticleDetail>(ARTICLE_ROUTES.BY_ID(id))
  },

  async getStats(): Promise<ArticleStats> {
    return apiClient.get<ArticleStats>(ARTICLE_ROUTES.STATS)
  },

  async updateStatus(id: string, payload: UpdateArticleStatusRequest): Promise<void> {
    return apiClient.patch(ARTICLE_ROUTES.STATUS(id), payload)
  },

  async bulkSchedule(payload: BulkScheduleRequest): Promise<void> {
    return apiClient.post(ARTICLE_ROUTES.BULK_SCHEDULE, payload)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(ARTICLE_ROUTES.BY_ID(id))
  },
}
