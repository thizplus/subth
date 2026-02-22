import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from './service'
import type { UserListParams, UpdateProfilePayload, ActivityLogParams } from './types'

export const userKeys = {
  all: ['users'] as const,
  list: (params?: UserListParams) => [...userKeys.all, 'list', params] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  stats: (id: string) => [...userKeys.all, 'stats', id] as const,
  activity: (id: string, params?: ActivityLogParams) => [...userKeys.all, 'activity', id, params] as const,
}

export const activityKeys = {
  all: ['activity'] as const,
  list: (params?: ActivityLogParams) => [...activityKeys.all, 'list', params] as const,
}

export function useUserList(params?: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getList(params),
  })
}

export function useUserById(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  })
}

export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => userService.getProfile(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    },
  })
}

// User Stats
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: userKeys.stats(userId),
    queryFn: () => userService.getUserStats(userId),
    enabled: !!userId,
  })
}

// User Activity (admin)
export function useUserActivity(userId: string, params?: ActivityLogParams) {
  return useQuery({
    queryKey: userKeys.activity(userId, params),
    queryFn: () => userService.getUserActivity(userId, params),
    enabled: !!userId,
  })
}

// All Activity (admin)
export function useAllActivity(params?: ActivityLogParams) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => userService.getAllActivity(params),
  })
}

// Popular Pages (admin)
export function usePopularPages(pageType: string, days = 7, limit = 10) {
  return useQuery({
    queryKey: [...activityKeys.all, 'popular', pageType, days, limit] as const,
    queryFn: () => userService.getPopularPages(pageType, days, limit),
  })
}

// Activity Summary (admin)
export function useActivitySummary(days = 7) {
  return useQuery({
    queryKey: [...activityKeys.all, 'summary', days] as const,
    queryFn: () => userService.getActivitySummary(days),
  })
}

// User Summary (admin) - สรุปจำนวนสมาชิก
export function useUserSummary() {
  return useQuery({
    queryKey: [...userKeys.all, 'summary'] as const,
    queryFn: () => userService.getUserSummary(),
  })
}
