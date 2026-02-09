// Semantic Search Types

export interface SemanticSearchResult {
  id: string;
  code?: string;
  title: string;
  thumbnail: string;
  similarity: number;
  autoTags?: string[];
}

export interface SemanticSearchResponse {
  videos: SemanticSearchResult[];
  total: number;
}

export interface SemanticSearchRequest {
  query: string;
  limit?: number;
  lang?: string;
}

// RAG Chat Types
export interface ChatRequest {
  message: string;
  limit?: number;
  cursor?: string;
}

export interface ChatResponse {
  message: string;
  videos: SemanticSearchResult[];
  keywords: string[];
  nextCursor?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  videos?: SemanticSearchResult[];
  keywords?: string[];
  timestamp: Date;
}

// Hybrid Search Types
export interface HybridSearchRequest {
  query: string;
  limit?: number;
  vectorWeight?: number;
  textWeight?: number;
  lang?: string;
  cursor?: string;
}

export interface HybridSearchResult {
  id: string;
  title: string;
  thumbnail: string;
  score: number;
  castNames?: string;
  makerName?: string;
}

export interface HybridSearchResponse {
  videos: HybridSearchResult[];
  total: number;
  nextCursor?: string;
}
