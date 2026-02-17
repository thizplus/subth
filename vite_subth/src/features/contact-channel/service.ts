import { apiClient } from '@/lib/api-client'
import { CONTACT_CHANNEL_ROUTES } from '@/constants/api-routes'
import type {
  ContactChannel,
  CreateContactChannelPayload,
  UpdateContactChannelPayload,
  ReorderContactChannelsPayload,
} from './types'

export const contactChannelService = {
  // Public - active only
  async getList(): Promise<ContactChannel[]> {
    return apiClient.get<ContactChannel[]>(CONTACT_CHANNEL_ROUTES.LIST)
  },

  // Admin - include inactive
  async getAdminList(): Promise<ContactChannel[]> {
    return apiClient.get<ContactChannel[]>(CONTACT_CHANNEL_ROUTES.ADMIN)
  },

  async getById(id: string): Promise<ContactChannel> {
    return apiClient.get<ContactChannel>(CONTACT_CHANNEL_ROUTES.BY_ID(id))
  },

  // Admin operations
  async create(payload: CreateContactChannelPayload): Promise<ContactChannel> {
    return apiClient.post<ContactChannel>(CONTACT_CHANNEL_ROUTES.LIST, payload)
  },

  async update(id: string, payload: UpdateContactChannelPayload): Promise<ContactChannel> {
    return apiClient.put<ContactChannel>(CONTACT_CHANNEL_ROUTES.BY_ID(id), payload)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(CONTACT_CHANNEL_ROUTES.BY_ID(id))
  },

  async reorder(payload: ReorderContactChannelsPayload): Promise<void> {
    return apiClient.put(CONTACT_CHANNEL_ROUTES.REORDER, payload)
  },
}
