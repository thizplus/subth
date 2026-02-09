export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalSales: number
  pendingOrders: number
}

export interface DashboardData {
  stats: DashboardStats
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'user' | 'order' | 'sale'
  message: string
  timestamp: string
}
