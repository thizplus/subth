import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type {
  SemanticSearchResponse,
  SemanticSearchRequest,
  ChatRequest,
  ChatResponse,
  HybridSearchRequest,
  HybridSearchResponse,
} from "./types";

export const semanticSearchService = {
  async searchByText(
    request: SemanticSearchRequest
  ): Promise<SemanticSearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("q", request.query);
    if (request.limit) searchParams.set("limit", String(request.limit));
    if (request.lang) searchParams.set("lang", request.lang);

    return apiClient.serverGet<SemanticSearchResponse>(
      `${API_ROUTES.SEMANTIC.SEARCH}?${searchParams.toString()}`,
      { revalidate: false }
    );
  },

  async getSimilarVideos(
    videoId: string,
    limit = 10
  ): Promise<SemanticSearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(limit));

    return apiClient.serverGet<SemanticSearchResponse>(
      `${API_ROUTES.SEMANTIC.SIMILAR(videoId)}?${searchParams.toString()}`,
      { revalidate: false }
    );
  },

  // RAG Chat - ค้นหาด้วย AI พร้อมข้อความตอบกลับ (cursor-based pagination)
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const payload: Record<string, unknown> = {
      message: request.message,
      limit: request.limit || 24,
    };
    if (request.cursor) {
      payload.cursor = request.cursor;
    }

    return apiClient.serverPost<ChatResponse>(
      API_ROUTES.CHAT.SEMANTIC,
      payload
    );
  },

  // Hybrid Search - ค้นหาแบบ hybrid (vector + text) สำหรับ AI Search
  // UI เหมือนเดิม - weights จัดการอัตโนมัติ
  async hybridSearch(request: HybridSearchRequest): Promise<HybridSearchResponse> {
    const payload: Record<string, unknown> = {
      query: request.query,
      limit: request.limit || 24,
      vectorWeight: 0.6,  // Default: balanced
      textWeight: 0.4,
      lang: request.lang || "th",
    };
    if (request.cursor) {
      payload.cursor = request.cursor;
    }

    return apiClient.serverPost<HybridSearchResponse>(
      API_ROUTES.SEMANTIC.HYBRID,
      payload
    );
  },
};
