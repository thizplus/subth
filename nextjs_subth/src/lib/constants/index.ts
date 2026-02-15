// API Base URL
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// CDN URL for images (Cloudflare R2)
export const CDN_URL =
  process.env.NEXT_PUBLIC_CDN_URL || "https://files.subth.com";

// API Routes
export const API_ROUTES = {
  // Auth
  AUTH: {
    GOOGLE: "/api/v1/auth/google",
    ME: "/api/v1/auth/me",
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
  },

  // Feed (Public)
  FEED: {
    LIST: "/api/v1/feed",
    REELS: "/api/v1/reels",
  },

  // Videos
  VIDEOS: {
    LIST: "/api/v1/videos",
    RANDOM: "/api/v1/videos/random",
    SEARCH: "/api/v1/videos/search",
    BY_CATEGORIES: "/api/v1/videos/by-categories",
    BY_CODE: (code: string) => `/api/v1/videos/code/${code}`,
    BY_ID: (id: string) => `/api/v1/videos/${id}`,
    BY_CAST: (id: string) => `/api/v1/videos/cast/${id}`,
    BY_TAG: (id: string) => `/api/v1/videos/tag/${id}`,
    BY_MAKER: (id: string) => `/api/v1/videos/maker/${id}`,
    AUTO_TAGS: "/api/v1/videos/auto-tags",
  },

  // Casts
  CASTS: {
    LIST: "/api/v1/casts",
    SEARCH: "/api/v1/casts/search",
    TOP: "/api/v1/casts/top",
    BY_SLUG: (slug: string) => `/api/v1/casts/slug/${slug}`,
    BY_ID: (id: string) => `/api/v1/casts/${id}`,
  },

  // Tags
  TAGS: {
    LIST: "/api/v1/tags",
    SEARCH: "/api/v1/tags/search",
    TOP: "/api/v1/tags/top",
    AUTO: "/api/v1/tags/auto",
    BY_SLUG: (slug: string) => `/api/v1/tags/slug/${slug}`,
  },

  // Makers
  MAKERS: {
    LIST: "/api/v1/makers",
    SEARCH: "/api/v1/makers/search",
    TOP: "/api/v1/makers/top",
    BY_SLUG: (slug: string) => `/api/v1/makers/slug/${slug}`,
  },

  // Stats
  STATS: {
    OVERVIEW: "/api/v1/stats",
    TOP_MAKERS: "/api/v1/stats/top-makers",
    TOP_CASTS: "/api/v1/stats/top-casts",
    TOP_TAGS: "/api/v1/stats/top-tags",
  },

  // Categories
  CATEGORIES: {
    LIST: "/api/v1/categories",
  },

  // Semantic Search (via Go backend -> Python CLIP Service)
  SEMANTIC: {
    SEARCH: "/api/v1/semantic/search",
    SIMILAR: (videoId: string) => `/api/v1/semantic/similar/${videoId}`,
    HYBRID: "/api/v1/semantic/hybrid",
  },

  // RAG Chat (via Go backend -> Python RAG Service -> Ollama)
  CHAT: {
    SEMANTIC: "/api/v1/chat/semantic",
  },

  // Reels
  REELS: {
    LIST: "/api/v1/reels",
    BY_ID: (id: string) => `/api/v1/reels/${id}`,
    LIKE: (id: string) => `/api/v1/reels/${id}/like`,
    COMMENTS: (id: string) => `/api/v1/reels/${id}/comments`,
    VIEW: (id: string) => `/api/v1/reels/${id}/view`,
  },

  // Comments
  COMMENTS: {
    RECENT: "/api/v1/comments/recent",
    BY_ID: (id: string) => `/api/v1/comments/${id}`,
    REPLIES: (id: string) => `/api/v1/comments/${id}/replies`,
  },

  // User Stats
  USER_STATS: {
    ME: "/api/v1/user/stats",
    BY_USER: (userId: string) => `/api/v1/users/${userId}/stats`,
    ADD_XP: "/api/v1/user/stats/xp",
    REGENERATE_TITLE: "/api/v1/user/stats/regenerate-title",
    TITLES: "/api/v1/user/stats/titles",
    LOGIN: "/api/v1/user/stats/login",
  },

  // Activity Log
  ACTIVITY: {
    LOG: "/api/v1/activity/log",
    ME: "/api/v1/activity/me",
    VIEWS: "/api/v1/activity/views",
  },
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
