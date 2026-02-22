// Barrel exports for user feature
export { UserProfile } from './components/UserProfile'
export { UserProfilePage } from './pages/UserProfilePage'
export { UserListPage } from './pages/UserListPage'
export { UserDetailPage } from './pages/UserDetailPage'
export { ActivityLogPage } from './pages/ActivityLogPage'
export {
  useUserList,
  useUserById,
  useUserProfile,
  useUpdateProfile,
  useUserStats,
  useUserActivity,
  useAllActivity,
  usePopularPages,
  useActivitySummary,
  useUserSummary,
  userKeys,
  activityKeys,
} from './hooks'
export { userService } from './service'
export type {
  UserProfile as UserProfileType,
  UserListItem,
  UpdateProfilePayload,
  UserListParams,
  UserStats,
  ActivityLog,
  ActivityLogWithUser,
  ActivityLogParams,
  PopularPage,
  PopularPagesResponse,
  ActivitySummaryResponse,
  UserSummary,
} from './types'
