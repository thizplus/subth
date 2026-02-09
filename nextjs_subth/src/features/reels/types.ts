// Reel item for TikTok-style reels page
export interface ReelItem {
  id: string;
  videoId?: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbUrl: string;
  coverUrl?: string;
  tags: string[];
  createdAt: string;
  // Engagement (future)
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  // Author (future)
  author?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isFollowing?: boolean;
  };
}

// API Response types
export interface ReelListResponse {
  success: boolean;
  data: ReelItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ReelListParams {
  page?: number;
  limit?: number;
  lang?: string;
}
