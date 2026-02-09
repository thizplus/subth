import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { makerService } from './service'
import type { MakerListParams, CreateMakerPayload, UpdateMakerPayload } from './types'

export const makerKeys = {
  all: ['makers'] as const,
  list: (params?: MakerListParams) => [...makerKeys.all, 'list', params] as const,
  detail: (id: string) => [...makerKeys.all, 'detail', id] as const,
  search: (query: string) => [...makerKeys.all, 'search', query] as const,
  top: (limit?: number) => [...makerKeys.all, 'top', limit] as const,
}

export function useMakerList(params?: MakerListParams) {
  return useQuery({
    queryKey: makerKeys.list(params),
    queryFn: () => makerService.getList(params),
  })
}

export function useMakerById(id: string) {
  return useQuery({
    queryKey: makerKeys.detail(id),
    queryFn: () => makerService.getById(id),
    enabled: !!id,
  })
}

export function useMakerSearch(query: string, limit = 10) {
  return useQuery({
    queryKey: makerKeys.search(query),
    queryFn: () => makerService.search(query, limit),
    enabled: query.length >= 2,
  })
}

export function useTopMakers(limit = 10) {
  return useQuery({
    queryKey: makerKeys.top(limit),
    queryFn: () => makerService.getTop(limit),
  })
}

// Mutations สำหรับ Admin
export function useCreateMaker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMakerPayload) => makerService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: makerKeys.all })
    },
  })
}

export function useUpdateMaker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMakerPayload }) =>
      makerService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: makerKeys.all })
      queryClient.invalidateQueries({ queryKey: makerKeys.detail(id) })
    },
  })
}

export function useDeleteMaker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => makerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: makerKeys.all })
    },
  })
}
