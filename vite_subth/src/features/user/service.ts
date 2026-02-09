import { apiClient, type PaginationMeta } from '@/lib/api-client'
import { USER_ROUTES, ACTIVITY_ROUTES, USER_STATS_ROUTES } from '@/constants/api-routes'
import type {
  UserProfile,
  UserListItem,
  UpdateProfilePayload,
  UserListParams,
  UserStats,
  ActivityLog,
  ActivityLogWithUser,
  ActivityLogParams,
  PopularPagesResponse,
  ActivitySummaryResponse,
} from './types'

export const userService = {
  async getList(params?: UserListParams): Promise<{ data: UserListItem[]; meta: PaginationMeta }> {
    // Response: { success: true, data: [...], meta: { total, page, limit, ... } }
    return apiClient.getPaginated<UserListItem>(USER_ROUTES.LIST, { params })
  },

  async getById(id: string): Promise<UserProfile> {
    // Response: { success: true, data: UserProfile }
    return apiClient.get<UserProfile>(USER_ROUTES.BY_ID(id))
  },

  async getProfile(): Promise<UserProfile> {
    // Response: { success: true, data: UserProfile }
    return apiClient.get<UserProfile>(USER_ROUTES.PROFILE)
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    // Response: { success: true, data: UserProfile }
    return apiClient.patch<UserProfile>(USER_ROUTES.PROFILE, payload)
  },

  // User Stats
  async getUserStats(userId: string): Promise<UserStats> {
    return apiClient.get<UserStats>(USER_STATS_ROUTES.BY_USER(userId))
  },

  // User Activity (admin)
  async getUserActivity(
    userId: string,
    params?: ActivityLogParams
  ): Promise<{ data: ActivityLog[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<ActivityLog>(ACTIVITY_ROUTES.BY_USER(userId), { params })
  },

  // All Activity (admin)
  async getAllActivity(
    params?: ActivityLogParams
  ): Promise<{ data: ActivityLogWithUser[]; meta: PaginationMeta }> {
    return apiClient.getPaginated<ActivityLogWithUser>(ACTIVITY_ROUTES.ALL, { params })
  },

  // Popular Pages (admin)
  async getPopularPages(
    pageType: string,
    days = 7,
    limit = 10
  ): Promise<PopularPagesResponse> {
    return apiClient.get<PopularPagesResponse>(ACTIVITY_ROUTES.POPULAR, {
      params: { pageType, days, limit },
    })
  },

  // Activity Summary (admin)
  async getActivitySummary(days = 7): Promise<ActivitySummaryResponse> {
    return apiClient.get<ActivitySummaryResponse>(ACTIVITY_ROUTES.SUMMARY, {
      params: { days },
    })
  },
}
