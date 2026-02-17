import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactChannelService } from './service'
import type {
  CreateContactChannelPayload,
  UpdateContactChannelPayload,
  ReorderContactChannelsPayload,
} from './types'

export const contactChannelKeys = {
  all: ['contact-channels'] as const,
  list: () => [...contactChannelKeys.all, 'list'] as const,
  adminList: () => [...contactChannelKeys.all, 'admin-list'] as const,
  detail: (id: string) => [...contactChannelKeys.all, 'detail', id] as const,
}

// Public list (active only)
export function useContactChannelList() {
  return useQuery({
    queryKey: contactChannelKeys.list(),
    queryFn: () => contactChannelService.getList(),
  })
}

// Admin list (include inactive)
export function useContactChannelAdminList() {
  return useQuery({
    queryKey: contactChannelKeys.adminList(),
    queryFn: () => contactChannelService.getAdminList(),
  })
}

export function useContactChannelById(id: string) {
  return useQuery({
    queryKey: contactChannelKeys.detail(id),
    queryFn: () => contactChannelService.getById(id),
    enabled: !!id,
  })
}

// Mutations สำหรับ Admin
export function useCreateContactChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateContactChannelPayload) => contactChannelService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactChannelKeys.all })
    },
  })
}

export function useUpdateContactChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContactChannelPayload }) =>
      contactChannelService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contactChannelKeys.all })
      queryClient.invalidateQueries({ queryKey: contactChannelKeys.detail(id) })
    },
  })
}

export function useDeleteContactChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contactChannelService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactChannelKeys.all })
    },
  })
}

export function useReorderContactChannels() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReorderContactChannelsPayload) => contactChannelService.reorder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactChannelKeys.all })
    },
  })
}
