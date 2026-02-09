import { apiClient } from '@/lib/api-client'
import { DASHBOARD_ROUTES } from '@/constants/api-routes'
import type { DashboardStats } from './types'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    // Response: { success: true, data: DashboardStats }
    return apiClient.get<DashboardStats>(DASHBOARD_ROUTES.STATS)
  },

  async getAdminDashboard(): Promise<DashboardStats> {
    // Response: { success: true, data: DashboardStats }
    return apiClient.get<DashboardStats>(DASHBOARD_ROUTES.ADMIN)
  },

  async getAgentDashboard(): Promise<DashboardStats> {
    // Response: { success: true, data: DashboardStats }
    return apiClient.get<DashboardStats>(DASHBOARD_ROUTES.AGENT)
  },

  async getSalesDashboard(): Promise<DashboardStats> {
    // Response: { success: true, data: DashboardStats }
    return apiClient.get<DashboardStats>(DASHBOARD_ROUTES.SALES)
  },
}
