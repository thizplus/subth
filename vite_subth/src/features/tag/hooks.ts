import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagService } from './service'
import type { TagListParams, CreateTagPayload, UpdateTagPayload } from './types'

export const tagKeys = {
  all: ['tags'] as const,
  list: (params?: TagListParams) => [...tagKeys.all, 'list', params] as const,
  detail: (id: string, lang?: string) => [...tagKeys.all, 'detail', id, lang] as const,
  search: (query: string, lang?: string) => [...tagKeys.all, 'search', query, lang] as const,
  top: (limit?: number, lang?: string) => [...tagKeys.all, 'top', limit, lang] as const,
  auto: (lang?: string, category?: string) => [...tagKeys.all, 'auto', lang, category] as const,
}

export function useTagList(params?: TagListParams) {
  return useQuery({
    queryKey: tagKeys.list(params),
    queryFn: () => tagService.getList(params),
  })
}

export function useTagById(id: string, lang = 'en') {
  return useQuery({
    queryKey: tagKeys.detail(id, lang),
    queryFn: () => tagService.getById(id, lang),
    enabled: !!id,
  })
}

export function useTagSearch(query: string, lang = 'en', limit = 10) {
  return useQuery({
    queryKey: tagKeys.search(query, lang),
    queryFn: () => tagService.search(query, lang, limit),
    enabled: query.length >= 2,
  })
}

export function useTopTags(limit = 10, lang = 'en') {
  return useQuery({
    queryKey: tagKeys.top(limit, lang),
    queryFn: () => tagService.getTop(limit, lang),
  })
}

export function useAutoTags(lang = 'en', category?: string) {
  return useQuery({
    queryKey: tagKeys.auto(lang, category),
    queryFn: () => tagService.getAutoTags(lang, category),
  })
}

// Mutations สำหรับ Admin
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTagPayload) => tagService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTagPayload }) =>
      tagService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(id) })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tagService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}
