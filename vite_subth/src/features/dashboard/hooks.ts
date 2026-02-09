import { useQuery } from '@tanstack/react-query'
import { dashboardService } from './service'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  admin: () => [...dashboardKeys.all, 'admin'] as const,
  agent: () => [...dashboardKeys.all, 'agent'] as const,
  sales: () => [...dashboardKeys.all, 'sales'] as const,
}

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
  })
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: () => dashboardService.getAdminDashboard(),
  })
}

export function useAgentDashboard() {
  return useQuery({
    queryKey: dashboardKeys.agent(),
    queryFn: () => dashboardService.getAgentDashboard(),
  })
}

export function useSalesDashboard() {
  return useQuery({
    queryKey: dashboardKeys.sales(),
    queryFn: () => dashboardService.getSalesDashboard(),
  })
}
