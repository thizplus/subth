import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reelService } from './service'
import type { ReelListParams, SyncReelRequest, CreateReelRequest, UpdateReelRequest } from './types'

export const reelKeys = {
  all: ['reels'] as const,
  list: (params?: ReelListParams) => [...reelKeys.all, 'list', params] as const,
  detail: (id: string) => [...reelKeys.all, 'detail', id] as const,
}

export function useReelList(params?: ReelListParams) {
  return useQuery({
    queryKey: reelKeys.list(params),
    queryFn: () => reelService.getList(params),
  })
}

export function useReelById(id: string) {
  return useQuery({
    queryKey: reelKeys.detail(id),
    queryFn: () => reelService.getById(id),
    enabled: !!id,
  })
}

export function useCreateReel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReelRequest) => reelService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reelKeys.all })
    },
  })
}

export function useUpdateReel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReelRequest }) =>
      reelService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reelKeys.all })
    },
  })
}

export function useDeleteReel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reelService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reelKeys.all })
    },
  })
}

export function useSyncReel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SyncReelRequest) => reelService.syncFromSuekk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reelKeys.all })
    },
  })
}
