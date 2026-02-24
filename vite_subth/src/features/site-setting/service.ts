import { apiClient } from '@/lib/api-client'
import { SITE_SETTING_ROUTES } from '@/constants/api-routes'
import type { SiteSetting, UpdateSiteSettingPayload } from './types'

export const siteSettingService = {
  async get(): Promise<SiteSetting> {
    return apiClient.get<SiteSetting>(SITE_SETTING_ROUTES.GET)
  },

  async update(payload: UpdateSiteSettingPayload): Promise<SiteSetting> {
    return apiClient.put<SiteSetting>(SITE_SETTING_ROUTES.UPDATE, payload)
  },
}
