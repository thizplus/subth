// Tag types - aligned with gofiber_subth backend DTOs

// For list endpoints (TagResponse)
export interface Tag {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
}

// For detail endpoint (TagDetailResponse)
export interface TagDetail extends Tag {
  description?: string;
  translations?: Record<string, string>; // { en: "...", th: "...", ja: "..." }
  createdAt: string;
}

// For auto tags (AutoTagLabelResponse)
export interface AutoTagLabel {
  key: string;
  name: string;
  category: string;
}

export interface TagListParams {
  page?: number;
  limit?: number;
  search?: string;
  lang?: string;
}

// Backend uses offset-based pagination
export interface TagListResponse {
  success: boolean;
  message: string;
  data: Tag[];
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
  error?: string;
}

export interface TagDetailResponse {
  success: boolean;
  message: string;
  data: TagDetail;
  error?: string;
}
