// Contact Channel types ตาม backend response

export type Platform =
  | 'telegram'
  | 'line'
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'email'
  | 'website'

export interface ContactChannel {
  id: string
  platform: Platform
  title: string
  description?: string
  url: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Request types
export interface CreateContactChannelPayload {
  platform: Platform
  title: string
  description?: string
  url: string
  isActive?: boolean
}

export interface UpdateContactChannelPayload {
  platform?: Platform
  title?: string
  description?: string
  url?: string
  isActive?: boolean
}

export interface ReorderContactChannelsPayload {
  ids: string[]
}

// Platform labels for UI
export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'line', label: 'LINE' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
]
