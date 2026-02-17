import type { RoleType } from '@/constants/enums'

export interface UserProfile {
  id: string
  email: string
  username: string
  displayName: string
  firstName: string
  lastName: string
  role: RoleType
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserListItem {
  id: string
  email: string
  username: string
  displayName: string
  firstName: string
  lastName: string
  role: RoleType
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  avatar?: string
}

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  role?: RoleType
}

// User Stats
export interface UserStats {
  id: string
  userId: string
  xp: number
  level: number
  title: string
  titleGeneratedAt?: string
  totalViews: number
  totalLikes: number
  totalComments: number
  loginStreak: number
  peakHour: number
  xpProgress: number
  xpToNextLevel: number
  levelBadge: string
}

// Activity Log
export interface ActivityLog {
  id: string
  userId: string
  pageType: string
  pageId?: string
  pageTitle?: string
  path: string
  metadata?: string
  createdAt: string
}

export interface ActivityLogWithUser extends ActivityLog {
  username: string
  displayName: string
  avatar: string
  ipAddress: string
  userAgent: string
}

export interface ActivityLogParams {
  page?: number
  limit?: number
  pageType?: string
}

// Analytics
export interface PopularPage {
  pageId: string
  pageType: string
  viewCount: number
}

export interface PopularPagesResponse {
  pageType: string
  days: number
  startDate: string
  endDate: string
  data: PopularPage[]
}

export interface ActivitySummaryResponse {
  days: number
  startDate: string
  endDate: string
  summary: Record<string, PopularPage[]>
}
