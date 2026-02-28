"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth";
import { engagementService } from "./service";
import { showXPNotification } from "./components/xp-notification";
import type { CreateCommentRequest, UpdateCommentRequest } from "./types";

// ========== Query Keys ==========

export const engagementKeys = {
  all: ["engagement"] as const,
  // Reel engagement
  likes: () => [...engagementKeys.all, "likes"] as const,
  like: (reelId: string) => [...engagementKeys.likes(), reelId] as const,
  comments: () => [...engagementKeys.all, "comments"] as const,
  commentList: (reelId: string) => [...engagementKeys.comments(), "list", reelId] as const,
  replies: (commentId: string) => [...engagementKeys.comments(), "replies", commentId] as const,
  // Article engagement
  articleLikes: () => [...engagementKeys.all, "articleLikes"] as const,
  articleLike: (articleId: string) => [...engagementKeys.articleLikes(), articleId] as const,
  articleComments: () => [...engagementKeys.all, "articleComments"] as const,
  articleCommentList: (articleId: string) =>
    [...engagementKeys.articleComments(), "list", articleId] as const,
};

// ========== LIKE HOOKS ==========

// Get like status for a reel
export function useLikeStatus(reelId: string) {
  return useQuery({
    queryKey: engagementKeys.like(reelId),
    queryFn: () => engagementService.getLikeStatus(reelId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Toggle like mutation
export function useToggleLike() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => !!state.token);

  return useMutation({
    mutationFn: (reelId: string) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      return engagementService.toggleLike(reelId);
    },
    onSuccess: (data, reelId) => {
      // Update the cache with new like status
      queryClient.setQueryData(engagementKeys.like(reelId), data);
      // Invalidate feed/reels queries to refresh isLiked status
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      // Show XP notification if liked (XP may or may not be awarded depending on cooldown)
      if (data.data.isLiked) {
        showXPNotification({ amount: 2, source: "like" });
      }
    },
  });
}

// ========== COMMENT HOOKS ==========

// Get comments for a reel (infinite scroll)
export function useComments(reelId: string, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: engagementKeys.commentList(reelId),
    queryFn: ({ pageParam = 1 }) =>
      engagementService.getComments(reelId, pageParam, limit),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// Create comment mutation
export function useCreateComment() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => !!state.token);

  return useMutation({
    mutationFn: ({ reelId, data }: { reelId: string; data: CreateCommentRequest }) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      return engagementService.createComment(reelId, data);
    },
    onSuccess: (_, { reelId }) => {
      // Invalidate comments list to refetch
      queryClient.invalidateQueries({ queryKey: engagementKeys.commentList(reelId) });
      // Show XP notification (XP may or may not be awarded depending on daily limit)
      showXPNotification({ amount: 10, source: "comment" });
    },
  });
}

// Update comment mutation
export function useUpdateComment() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => !!state.token);

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      reelId: string;
      data: UpdateCommentRequest;
    }) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      return engagementService.updateComment(commentId, data);
    },
    onSuccess: (_, { reelId }) => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.commentList(reelId) });
    },
  });
}

// Delete comment mutation
export function useDeleteComment() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => !!state.token);

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; reelId: string }) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      return engagementService.deleteComment(commentId);
    },
    onSuccess: (_, { reelId }) => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.commentList(reelId) });
    },
  });
}

// Get replies for a comment (infinite scroll)
export function useReplies(commentId: string, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: engagementKeys.replies(commentId),
    queryFn: ({ pageParam = 1 }) =>
      engagementService.getReplies(commentId, pageParam, limit),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!commentId,
  });
}

// ========== ARTICLE LIKE HOOKS ==========

// Get like status for an article
export function useArticleLikeStatus(articleId: string) {
  return useQuery({
    queryKey: engagementKeys.articleLike(articleId),
    queryFn: () => engagementService.getArticleLikeStatus(articleId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Toggle article like mutation
export function useToggleArticleLike() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => !!state.token);

  return useMutation({
    mutationFn: (articleId: string) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      return engagementService.toggleArticleLike(articleId);
    },
    onSuccess: (data, articleId) => {
      // Update the cache with new like status
      queryClient.setQueryData(engagementKeys.articleLike(articleId), data);
      // Invalidate article queries to refresh
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      // Show XP notification if liked
      if (data.data.isLiked) {
        showXPNotification({ amount: 2, source: "like" });
      }
    },
  });
}

// ========== ARTICLE COMMENT HOOKS ==========

// Get comments for an article (infinite scroll)
export function useArticleComments(articleId: string, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: engagementKeys.articleCommentList(articleId),
    queryFn: ({ pageParam = 1 }) =>
      engagementService.getArticleComments(articleId, pageParam, limit),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// Create article comment mutation
export function useCreateArticleComment() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => !!state.token);

  return useMutation({
    mutationFn: ({
      articleId,
      data,
    }: {
      articleId: string;
      data: CreateCommentRequest;
    }) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      return engagementService.createArticleComment(articleId, data);
    },
    onSuccess: (_, { articleId }) => {
      // Invalidate comments list to refetch
      queryClient.invalidateQueries({
        queryKey: engagementKeys.articleCommentList(articleId),
      });
      // Show XP notification
      showXPNotification({ amount: 10, source: "comment" });
    },
  });
}

// Delete article comment mutation
export function useDeleteArticleComment() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => !!state.token);

  return useMutation({
    mutationFn: ({
      articleId,
      commentId,
    }: {
      articleId: string;
      commentId: string;
    }) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      return engagementService.deleteArticleComment(articleId, commentId);
    },
    onSuccess: (_, { articleId }) => {
      queryClient.invalidateQueries({
        queryKey: engagementKeys.articleCommentList(articleId),
      });
    },
  });
}
