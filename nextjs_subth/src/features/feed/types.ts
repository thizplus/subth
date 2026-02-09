// Feed item for home page (cover image, title, tags)
export interface FeedItem {
  id: string;          // Reel ID
  videoId?: string;    // Video ID (for linking to video detail)
  title: string;
  description?: string;
  coverUrl: string;
  tags: string[];
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;   // from API, reduces separate API calls
  createdAt: string;
}

// Reel item for reels page (video player)
export interface ReelItem {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbUrl: string;
  tags: string[];
  createdAt: string;
}

// API Response types
export interface FeedListResponse {
  success: boolean;
  data: FeedItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

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

export interface FeedListParams {
  page?: number;
  limit?: number;
  lang?: string;
}
