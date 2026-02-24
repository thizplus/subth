// Cast types - aligned with gofiber_subth backend DTOs

// For list endpoints (CastResponse)
export interface Cast {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
}

// For detail endpoint (CastDetailResponse)
export interface CastDetail extends Cast {
  nameEn?: string;
  bio?: string;
  translations?: Record<string, string>; // { en: "...", th: "...", ja: "..." }
  createdAt: string;
}

export interface CastListParams {
  page?: number;
  limit?: number;
  search?: string;
  lang?: string;
}

// Backend uses offset-based pagination
export interface CastListResponse {
  success: boolean;
  message: string;
  data: Cast[];
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
  error?: string;
}

export interface CastDetailResponse {
  success: boolean;
  message: string;
  data: CastDetail;
  error?: string;
}
