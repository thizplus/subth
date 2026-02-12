import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from './service'
import type { CategoryListParams, CreateCategoryPayload, UpdateCategoryPayload, ReorderCategoriesPayload } from './types'

export const categoryKeys = {
  all: ['categories'] as const,
  list: (params?: CategoryListParams) => [...categoryKeys.all, 'list', params] as const,
  detail: (id: string, lang?: string) => [...categoryKeys.all, 'detail', id, lang] as const,
}

export function useCategoryList(params?: CategoryListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getList(params),
  })
}

export function useCategoryById(id: string, lang = 'en') {
  return useQuery({
    queryKey: categoryKeys.detail(id, lang),
    queryFn: () => categoryService.getById(id, lang),
    enabled: !!id,
  })
}

// Mutations สำหรับ Admin
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoryService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoryService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useReorderCategories() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReorderCategoriesPayload) => categoryService.reorder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}
