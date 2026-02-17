// Barrel exports for contact-channel feature
export {
  useContactChannelList,
  useContactChannelAdminList,
  useContactChannelById,
  useCreateContactChannel,
  useUpdateContactChannel,
  useDeleteContactChannel,
  useReorderContactChannels,
  contactChannelKeys,
} from './hooks'
export { contactChannelService } from './service'
export type {
  ContactChannel,
  Platform,
  CreateContactChannelPayload,
  UpdateContactChannelPayload,
  ReorderContactChannelsPayload,
} from './types'
export { PLATFORM_OPTIONS } from './types'

// Pages
export { ContactChannelListPage } from './pages/ContactChannelListPage'
