import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type {
  Video,
  VideoListItem,
  VideoListParams,
  VideoListResponse,
  CategoryWithVideos,
  VideosByCategoriesParams,
} from "./types";

export const videoService = {
  async getList(params?: VideoListParams): Promise<VideoListResponse> {
    const limit = params?.limit || 20;
    const page = params?.page || 1;

    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(limit));
    searchParams.set("page", String(page));
    if (params?.sort) searchParams.set("sort_by", params.sort);
    if (params?.order) searchParams.set("order", params.order);
    if (params?.lang) searchParams.set("lang", params.lang);
    if (params?.category) searchParams.set("category", params.category);

    return apiClient.serverGetRaw<VideoListResponse>(
      `${API_ROUTES.VIDEOS.LIST}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getById(id: string, lang?: string): Promise<Video> {
    const searchParams = new URLSearchParams();
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<Video>(
      `${API_ROUTES.VIDEOS.BY_ID(id)}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getByCode(code: string, lang?: string): Promise<Video> {
    const searchParams = new URLSearchParams();
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<Video>(
      `${API_ROUTES.VIDEOS.BY_CODE(code)}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getRandom(limit = 10, lang?: string): Promise<VideoListItem[]> {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(limit));
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<VideoListItem[]>(
      `${API_ROUTES.VIDEOS.RANDOM}?${searchParams.toString()}`,
      { revalidate: false }
    );
  },

  async search(
    query: string,
    params?: VideoListParams
  ): Promise<VideoListResponse> {
    const limit = params?.limit || 20;
    const page = params?.page || 1;

    const searchParams = new URLSearchParams();
    searchParams.set("q", query);
    searchParams.set("limit", String(limit));
    searchParams.set("page", String(page));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGetRaw<VideoListResponse>(
      `${API_ROUTES.VIDEOS.SEARCH}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getByCast(
    castId: string,
    params?: { page?: number; limit?: number; lang?: string }
  ): Promise<VideoListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params?.page || 1));
    searchParams.set("limit", String(params?.limit || 24));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGetRaw<VideoListResponse>(
      `${API_ROUTES.VIDEOS.BY_CAST(castId)}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getByTag(
    tagId: string,
    params?: { page?: number; limit?: number; lang?: string }
  ): Promise<VideoListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params?.page || 1));
    searchParams.set("limit", String(params?.limit || 24));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGetRaw<VideoListResponse>(
      `${API_ROUTES.VIDEOS.BY_TAG(tagId)}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getByMaker(
    makerId: string,
    params?: { page?: number; limit?: number; lang?: string }
  ): Promise<VideoListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params?.page || 1));
    searchParams.set("limit", String(params?.limit || 24));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGetRaw<VideoListResponse>(
      `${API_ROUTES.VIDEOS.BY_MAKER(makerId)}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getByCategories(
    params?: VideosByCategoriesParams
  ): Promise<CategoryWithVideos[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.categories)
      searchParams.set("categories", String(params.categories));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGet<CategoryWithVideos[]>(
      `${API_ROUTES.VIDEOS.BY_CATEGORIES}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },
};
