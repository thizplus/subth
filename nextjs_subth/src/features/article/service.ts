import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type { Article, ArticleListParams, ArticleListResponse } from "./types";

export const articleService = {
  /**
   * Get list of published articles (public, no auth required)
   */
  async getList(params?: ArticleListParams): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params?.page || 1));
    searchParams.set("limit", String(params?.limit || 20));
    if (params?.lang) searchParams.set("lang", params.lang);
    if (params?.search) searchParams.set("search", params.search);

    return apiClient.serverGetRaw<ArticleListResponse>(
      `${API_ROUTES.ARTICLES.LIST}?${searchParams.toString()}`,
      { revalidate: 60, tags: ["articles-list"] }
    );
  },

  /**
   * Get articles by cast slug (public)
   */
  async getByCast(slug: string, params?: ArticleListParams): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params?.page || 1));
    searchParams.set("limit", String(params?.limit || 20));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGetRaw<ArticleListResponse>(
      `${API_ROUTES.ARTICLES.BY_CAST(slug)}?${searchParams.toString()}`,
      { revalidate: 60, tags: [`articles-cast-${slug}`] }
    );
  },

  /**
   * Get articles by tag slug (public)
   */
  async getByTag(slug: string, params?: ArticleListParams): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params?.page || 1));
    searchParams.set("limit", String(params?.limit || 20));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGetRaw<ArticleListResponse>(
      `${API_ROUTES.ARTICLES.BY_TAG(slug)}?${searchParams.toString()}`,
      { revalidate: 60, tags: [`articles-tag-${slug}`] }
    );
  },

  /**
   * Get articles by maker slug (public)
   */
  async getByMaker(slug: string, params?: ArticleListParams): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params?.page || 1));
    searchParams.set("limit", String(params?.limit || 20));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGetRaw<ArticleListResponse>(
      `${API_ROUTES.ARTICLES.BY_MAKER(slug)}?${searchParams.toString()}`,
      { revalidate: 60, tags: [`articles-maker-${slug}`] }
    );
  },

  /**
   * Get published article by slug (public, no auth required)
   * Used by RSC for SEO pages
   */
  async getBySlug(slug: string, lang?: string): Promise<Article> {
    const searchParams = new URLSearchParams();
    if (lang) searchParams.set("lang", lang);

    const queryString = searchParams.toString();
    const url = queryString
      ? `${API_ROUTES.ARTICLES.BY_SLUG(slug)}?${queryString}`
      : API_ROUTES.ARTICLES.BY_SLUG(slug);

    return apiClient.serverGet<Article>(url, {
      revalidate: 60,
      tags: [`article-${slug}`],
    });
  },
};
