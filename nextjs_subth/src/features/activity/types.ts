// Page types ที่รองรับ
export type PageType =
  | "video"
  | "cast"
  | "tag"
  | "maker"
  | "category"
  | "search"
  | "ai-search"
  | "reel"
  | "feed"
  | "profile";

// Request สำหรับ log activity
export interface LogActivityRequest {
  pageType: PageType;
  pageId?: string; // UUID (nullable)
  path: string;
  metadata?: string; // JSON string
}

// Response หลัง log activity
export interface LogActivityResponse {
  success: boolean;
}

// Activity log record
export interface ActivityLog {
  id: string;
  userId: string;
  pageType: PageType;
  pageId?: string;
  path: string;
  metadata?: string;
  createdAt: string;
}

// Page view count
export interface PageViewCount {
  pageId: string;
  pageType: PageType;
  viewCount: number;
}
