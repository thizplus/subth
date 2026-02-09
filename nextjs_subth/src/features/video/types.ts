// Video types - aligned with gofiber_subth backend DTOs

// For list endpoints (VideoListItemResponse)
export interface VideoListItem {
  id: string;
  title: string;
  thumbnail?: string;
  category?: string;
  releaseDate?: string | null;
  maker?: string; // maker name as string in list
  casts?: CastListItem[];
}

export interface CastListItem {
  name: string;
}

// For detail endpoint (VideoResponse)
export interface Video {
  id: string;
  title: string;
  translations?: Record<string, string>; // { en: "...", th: "...", ja: "..." }
  thumbnail?: string;
  embedUrl?: string;
  category?: string;
  releaseDate?: string | null;
  maker?: Maker;
  casts?: Cast[];
  tags?: Tag[];
  autoTags?: AutoTag[];
  createdAt: string;
  updatedAt: string;
}

export interface Cast {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
}

export interface Maker {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
}

export interface AutoTag {
  key: string;
  name: string;
  category: string;
}

export interface VideoListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  lang?: string;
  category?: string;
}

// Backend uses offset-based pagination
export interface VideoListResponse {
  success: boolean;
  message: string;
  data: VideoListItem[];
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
  error?: string;
}

export interface VideoDetailResponse {
  success: boolean;
  message: string;
  data: Video;
  error?: string;
}

// Category with videos (for homepage)
export interface Category {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
}

export interface CategoryWithVideos {
  category: Category;
  videos: VideoListItem[];
}

export interface VideosByCategoriesParams {
  limit?: number; // videos per category
  categories?: number; // number of categories
  lang?: string;
}
