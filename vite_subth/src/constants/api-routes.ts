// Centralized API endpoints

export const AUTH_ROUTES = {
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  ME: '/api/v1/auth/me',
}

export const USER_ROUTES = {
  LIST: '/api/v1/users',
  BY_ID: (id: string) => `/api/v1/users/${id}`,
  PROFILE: '/api/v1/users/profile',
  SUMMARY: '/api/v1/users/summary',
}

export const DASHBOARD_ROUTES = {
  STATS: '/api/v1/dashboard/stats',
  ADMIN: '/api/v1/dashboard/admin',
  AGENT: '/api/v1/dashboard/agent',
  SALES: '/api/v1/dashboard/sales',
}

// ========== Video Management ==========

export const VIDEO_ROUTES = {
  LIST: '/api/v1/videos',
  BY_ID: (id: string) => `/api/v1/videos/${id}`,
  SEARCH: '/api/v1/videos/search',
  RANDOM: '/api/v1/videos/random',
  BY_MAKER: (makerId: string) => `/api/v1/videos/maker/${makerId}`,
  BY_CAST: (castId: string) => `/api/v1/videos/cast/${castId}`,
  BY_TAG: (tagId: string) => `/api/v1/videos/tag/${tagId}`,
  BATCH: '/api/v1/videos/batch',
}

export const MAKER_ROUTES = {
  LIST: '/api/v1/makers',
  BY_ID: (id: string) => `/api/v1/makers/${id}`,
  BY_SLUG: (slug: string) => `/api/v1/makers/slug/${slug}`,
  SEARCH: '/api/v1/makers/search',
  TOP: '/api/v1/makers/top',
}

export const CAST_ROUTES = {
  LIST: '/api/v1/casts',
  BY_ID: (id: string) => `/api/v1/casts/${id}`,
  BY_SLUG: (slug: string) => `/api/v1/casts/slug/${slug}`,
  SEARCH: '/api/v1/casts/search',
  TOP: '/api/v1/casts/top',
}

export const TAG_ROUTES = {
  LIST: '/api/v1/tags',
  BY_ID: (id: string) => `/api/v1/tags/${id}`,
  BY_SLUG: (slug: string) => `/api/v1/tags/slug/${slug}`,
  SEARCH: '/api/v1/tags/search',
  TOP: '/api/v1/tags/top',
  AUTO: '/api/v1/tags/auto',
  AUTO_BY_KEYS: '/api/v1/tags/auto/by-keys',
}

export const CATEGORY_ROUTES = {
  LIST: '/api/v1/categories',
  BY_ID: (id: string) => `/api/v1/categories/${id}`,
  REORDER: '/api/v1/categories/reorder',
}

export const STATS_ROUTES = {
  OVERVIEW: '/api/v1/stats',
  TOP_MAKERS: '/api/v1/stats/top-makers',
  TOP_CASTS: '/api/v1/stats/top-casts',
  TOP_TAGS: '/api/v1/stats/top-tags',
}

export const ACTIVITY_ROUTES = {
  ALL: '/api/v1/activity/all',
  BY_USER: (userId: string) => `/api/v1/users/${userId}/activity`,
  POPULAR: '/api/v1/activity/popular',
  SUMMARY: '/api/v1/activity/summary',
}

export const USER_STATS_ROUTES = {
  BY_USER: (userId: string) => `/api/v1/users/${userId}/stats`,
}

export const CONTACT_CHANNEL_ROUTES = {
  LIST: '/api/v1/contact-channels',
  ADMIN: '/api/v1/contact-channels/admin',
  BY_ID: (id: string) => `/api/v1/contact-channels/${id}`,
  REORDER: '/api/v1/contact-channels/reorder',
}

export const COMMUNITY_CHAT_ROUTES = {
  ONLINE_USERS: '/api/v1/community-chat/admin/online-users',
  ONLINE_COUNT: '/api/v1/community-chat/online',
}

export const ARTICLE_ROUTES = {
  LIST: '/api/v1/articles',
  BY_ID: (id: string) => `/api/v1/articles/${id}`,
  STATS: '/api/v1/articles/stats',
  STATUS: (id: string) => `/api/v1/articles/${id}/status`,
  BULK_SCHEDULE: '/api/v1/articles/bulk-schedule',
  BY_SLUG: (slug: string) => `/api/v1/articles/slug/${slug}`,
}
