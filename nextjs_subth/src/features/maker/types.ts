// Maker types - aligned with gofiber_subth backend DTOs
// Note: Makers do NOT support lang parameter - always returns English name

// For list endpoints (MakerResponse)
export interface Maker {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
}

// For detail endpoint (MakerDetailResponse)
export interface MakerDetail extends Maker {
  createdAt: string;
}

export interface MakerListParams {
  page?: number;
  limit?: number;
  search?: string;
  hasArticles?: boolean; // Filter only makers with published articles
  // Note: lang is NOT supported for makers
}

// Backend uses offset-based pagination
export interface MakerListResponse {
  success: boolean;
  message: string;
  data: Maker[];
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
  error?: string;
}

export interface MakerDetailResponse {
  success: boolean;
  message: string;
  data: MakerDetail;
  error?: string;
}
