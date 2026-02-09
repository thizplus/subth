import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { castService } from './service'
import type { CastListParams, CreateCastPayload, UpdateCastPayload } from './types'

export const castKeys = {
  all: ['casts'] as const,
  list: (params?: CastListParams) => [...castKeys.all, 'list', params] as const,
  detail: (id: string, lang?: string) => [...castKeys.all, 'detail', id, lang] as const,
  search: (query: string, lang?: string) => [...castKeys.all, 'search', query, lang] as const,
  top: (limit?: number, lang?: string) => [...castKeys.all, 'top', limit, lang] as const,
}

export function useCastList(params?: CastListParams) {
  return useQuery({
    queryKey: castKeys.list(params),
    queryFn: () => castService.getList(params),
  })
}

export function useCastById(id: string, lang = 'en') {
  return useQuery({
    queryKey: castKeys.detail(id, lang),
    queryFn: () => castService.getById(id, lang),
    enabled: !!id,
  })
}

export function useCastSearch(query: string, lang = 'en', limit = 10) {
  return useQuery({
    queryKey: castKeys.search(query, lang),
    queryFn: () => castService.search(query, lang, limit),
    enabled: query.length >= 2,
  })
}

export function useTopCasts(limit = 10, lang = 'en') {
  return useQuery({
    queryKey: castKeys.top(limit, lang),
    queryFn: () => castService.getTop(limit, lang),
  })
}

// Mutations สำหรับ Admin
export function useCreateCast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCastPayload) => castService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: castKeys.all })
    },
  })
}

export function useUpdateCast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCastPayload }) =>
      castService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: castKeys.all })
      queryClient.invalidateQueries({ queryKey: castKeys.detail(id) })
    },
  })
}

export function useDeleteCast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => castService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: castKeys.all })
    },
  })
}
