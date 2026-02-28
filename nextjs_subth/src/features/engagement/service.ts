"use client";

import { apiClient } from "@/lib/api-client";
import { API_ROUTES, API_URL } from "@/lib/constants";
import type {
  LikeResponse,
  CommentListResponse,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  RecentCommentsResponse,
} from "./types";

export const engagementService = {
  // ========== REEL LIKES ==========

  // Toggle like on a reel (requires auth)
  toggleLike(reelId: string): Promise<LikeResponse> {
    return apiClient.postRaw<LikeResponse>(API_ROUTES.REELS.LIKE(reelId));
  },

  // Get like status for a reel
  getLikeStatus(reelId: string): Promise<LikeResponse> {
    return apiClient.getRaw<LikeResponse>(API_ROUTES.REELS.LIKE(reelId));
  },

  // ========== ARTICLE LIKES ==========

  // Toggle like on an article (requires auth)
  toggleArticleLike(articleId: string): Promise<LikeResponse> {
    return apiClient.postRaw<LikeResponse>(API_ROUTES.ARTICLES.LIKE(articleId));
  },

  // Get like status for an article
  getArticleLikeStatus(articleId: string): Promise<LikeResponse> {
    return apiClient.getRaw<LikeResponse>(API_ROUTES.ARTICLES.LIKE(articleId));
  },

  // ========== COMMENTS ==========

  // Get comments for a reel (public)
  async getComments(reelId: string, page = 1, limit = 20): Promise<CommentListResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiClient.getRaw<CommentListResponse>(`${API_ROUTES.REELS.COMMENTS(reelId)}?${params}`);
  },

  // Create a comment (requires auth)
  createComment(reelId: string, data: CreateCommentRequest): Promise<{ success: boolean; data: Comment }> {
    return apiClient.postRaw<{ success: boolean; data: Comment }>(API_ROUTES.REELS.COMMENTS(reelId), data);
  },

  // Update a comment (requires auth, owner only)
  updateComment(commentId: string, data: UpdateCommentRequest): Promise<{ success: boolean; data: Comment }> {
    return apiClient.postRaw<{ success: boolean; data: Comment }>(API_ROUTES.COMMENTS.BY_ID(commentId), data);
  },

  // Delete a comment (requires auth, owner only)
  deleteComment(commentId: string): Promise<void> {
    return apiClient.delete(API_ROUTES.COMMENTS.BY_ID(commentId));
  },

  // Get replies for a comment (public)
  async getReplies(commentId: string, page = 1, limit = 20): Promise<CommentListResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiClient.getRaw<CommentListResponse>(`${API_ROUTES.COMMENTS.REPLIES(commentId)}?${params}`);
  },

  // Get recent comments across all reels (public)
  async getRecentComments(limit = 10): Promise<RecentCommentsResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    return apiClient.getRaw<RecentCommentsResponse>(`${API_ROUTES.COMMENTS.RECENT}?${params}`);
  },

  // ========== ARTICLE COMMENTS ==========

  // Get comments for an article (public)
  async getArticleComments(
    articleId: string,
    page = 1,
    limit = 20
  ): Promise<CommentListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return apiClient.getRaw<CommentListResponse>(
      `${API_ROUTES.ARTICLES.COMMENTS(articleId)}?${params}`
    );
  },

  // Create a comment on an article (requires auth)
  createArticleComment(
    articleId: string,
    data: CreateCommentRequest
  ): Promise<{ success: boolean; data: Comment }> {
    return apiClient.postRaw<{ success: boolean; data: Comment }>(
      API_ROUTES.ARTICLES.COMMENTS(articleId),
      data
    );
  },

  // Update an article comment (requires auth, owner only)
  async updateArticleComment(
    articleId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<{ success: boolean; data: Comment }> {
    // Get token from localStorage
    const authStorage =
      typeof window !== "undefined"
        ? localStorage.getItem("auth-storage")
        : null;
    const token = authStorage
      ? JSON.parse(authStorage)?.state?.token
      : null;

    const response = await fetch(
      `${API_URL}${API_ROUTES.ARTICLES.COMMENT_BY_ID(articleId, commentId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  // Delete an article comment (requires auth, owner only)
  deleteArticleComment(articleId: string, commentId: string): Promise<void> {
    return apiClient.delete(
      API_ROUTES.ARTICLES.COMMENT_BY_ID(articleId, commentId)
    );
  },
};
