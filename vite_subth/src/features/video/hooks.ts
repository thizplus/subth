import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videoService } from './service'
import type {
  VideoListParams,
  CreateVideoPayload,
  UpdateVideoPayload,
  BatchCreateVideoPayload,
} from './types'

export const videoKeys = {
  all: ['videos'] as const,
  list: (params?: VideoListParams) => [...videoKeys.all, 'list', params] as const,
  detail: (id: string, lang?: string) => [...videoKeys.all, 'detail', id, lang] as const,
  search: (query: string, params?: object) => [...videoKeys.all, 'search', query, params] as const,
  random: (limit?: number) => [...videoKeys.all, 'random', limit] as const,
  byMaker: (makerId: string, params?: object) => [...videoKeys.all, 'byMaker', makerId, params] as const,
  byCast: (castId: string, params?: object) => [...videoKeys.all, 'byCast', castId, params] as const,
  byTag: (tagId: string, params?: object) => [...videoKeys.all, 'byTag', tagId, params] as const,
}

export function useVideoList(params?: VideoListParams) {
  return useQuery({
    queryKey: videoKeys.list(params),
    queryFn: () => videoService.getList(params),
  })
}

export function useVideoById(id: string, lang = 'en') {
  return useQuery({
    queryKey: videoKeys.detail(id, lang),
    queryFn: () => videoService.getById(id, lang),
    enabled: !!id,
  })
}

export function useVideoSearch(query: string, params?: Omit<VideoListParams, 'search'>) {
  return useQuery({
    queryKey: videoKeys.search(query, params),
    queryFn: () => videoService.search(query, params),
    enabled: query.length >= 2,
  })
}

export function useRandomVideos(limit = 10, lang = 'en') {
  return useQuery({
    queryKey: videoKeys.random(limit),
    queryFn: () => videoService.getRandom(limit, lang),
  })
}

export function useVideosByMaker(makerId: string, params?: VideoListParams) {
  return useQuery({
    queryKey: videoKeys.byMaker(makerId, params),
    queryFn: () => videoService.getByMaker(makerId, params),
    enabled: !!makerId,
  })
}

export function useVideosByCast(castId: string, params?: VideoListParams) {
  return useQuery({
    queryKey: videoKeys.byCast(castId, params),
    queryFn: () => videoService.getByCast(castId, params),
    enabled: !!castId,
  })
}

export function useVideosByTag(tagId: string, params?: VideoListParams) {
  return useQuery({
    queryKey: videoKeys.byTag(tagId, params),
    queryFn: () => videoService.getByTag(tagId, params),
    enabled: !!tagId,
  })
}

// Mutations สำหรับ Admin
export function useCreateVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateVideoPayload) => videoService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all })
    },
  })
}

export function useCreateVideoBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BatchCreateVideoPayload) => videoService.createBatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all })
    },
  })
}

export function useUpdateVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVideoPayload }) =>
      videoService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all })
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(id) })
    },
  })
}

export function useDeleteVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => videoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all })
    },
  })
}
