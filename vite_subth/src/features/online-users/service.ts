import { apiClient } from '@/lib/api-client'
import { COMMUNITY_CHAT_ROUTES } from '@/constants'
import type { OnlineUser } from './types'

export const onlineUsersService = {
  async getOnlineUsers(): Promise<OnlineUser[]> {
    return apiClient.get<OnlineUser[]>(COMMUNITY_CHAT_ROUTES.ONLINE_USERS)
  },

  async getOnlineCount(): Promise<number> {
    const res = await apiClient.get<{ count: number }>(COMMUNITY_CHAT_ROUTES.ONLINE_COUNT)
    return res.count
  },
}
