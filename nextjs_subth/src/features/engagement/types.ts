// Like types
export interface LikeStatus {
  isLiked: boolean;
  likesCount: number;
}

export interface LikeResponse {
  success: boolean;
  data: LikeStatus;
}

// Comment types
export interface CommentUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  levelBadge: string;
}

export interface Comment {
  id: string;
  userId: string;
  reelId: string;
  parentId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: CommentUser;
  repliesCount?: number;
}

export interface CommentListResponse {
  success: boolean;
  data: Comment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Recent comment with reel info
export interface ReelBrief {
  id: string;
  title: string;
  thumbnail: string;
}

export interface RecentComment {
  id: string;
  content: string;
  createdAt: string;
  user?: CommentUser;
  reel?: ReelBrief;
}

export interface RecentCommentsResponse {
  success: boolean;
  data: RecentComment[];
}
