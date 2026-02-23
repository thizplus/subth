import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { articleService } from './service'
import type {
  ArticleListParams,
  UpdateArticleStatusRequest,
  BulkScheduleRequest,
} from './types'

export const articleKeys = {
  all: ['articles'] as const,
  list: (params?: ArticleListParams) => [...articleKeys.all, 'list', params] as const,
  detail: (id: string) => [...articleKeys.all, 'detail', id] as const,
  stats: () => [...articleKeys.all, 'stats'] as const,
}

export function useArticleList(params?: ArticleListParams) {
  return useQuery({
    queryKey: articleKeys.list(params),
    queryFn: () => articleService.getList(params),
  })
}

export function useArticleById(id: string) {
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: () => articleService.getById(id),
    enabled: !!id,
  })
}

export function useArticleStats() {
  return useQuery({
    queryKey: articleKeys.stats(),
    queryFn: () => articleService.getStats(),
  })
}

export function useUpdateArticleStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateArticleStatusRequest }) =>
      articleService.updateStatus(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all })
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(id) })
    },
  })
}

export function useBulkScheduleArticles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkScheduleRequest) => articleService.bulkSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all })
    },
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => articleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all })
    },
  })
}
