import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { siteSettingService } from './service'
import type { UpdateSiteSettingPayload } from './types'

export const siteSettingKeys = {
  all: ['site-setting'] as const,
  detail: () => [...siteSettingKeys.all, 'detail'] as const,
}

export function useSiteSetting() {
  return useQuery({
    queryKey: siteSettingKeys.detail(),
    queryFn: () => siteSettingService.get(),
  })
}

export function useUpdateSiteSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSiteSettingPayload) => siteSettingService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingKeys.all })
    },
  })
}
