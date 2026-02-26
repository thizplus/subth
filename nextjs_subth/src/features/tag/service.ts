import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type {
  Tag,
  TagDetail,
  TagListParams,
  TagListResponse,
  AutoTagLabel,
} from "./types";

export const tagService = {
  async getList(params?: TagListParams): Promise<TagListResponse> {
    const limit = params?.limit || 50;
    const page = params?.page || 1;

    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(limit));
    searchParams.set("page", String(page));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.lang) searchParams.set("lang", params.lang);
    if (params?.hasArticles) searchParams.set("hasArticles", "true");

    return apiClient.serverGetRaw<TagListResponse>(
      `${API_ROUTES.TAGS.LIST}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getById(id: string, lang?: string): Promise<TagDetail> {
    const searchParams = new URLSearchParams();
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<TagDetail>(
      `${API_ROUTES.TAGS.BY_SLUG(id)}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getBySlug(slug: string, lang?: string): Promise<TagDetail> {
    const searchParams = new URLSearchParams();
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<TagDetail>(
      `${API_ROUTES.TAGS.BY_SLUG(slug)}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getTop(limit: number = 20, lang?: string): Promise<Tag[]> {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(limit));
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<Tag[]>(
      `${API_ROUTES.TAGS.TOP}?${searchParams.toString()}`,
      { revalidate: 300 }
    );
  },

  async search(query: string, lang?: string): Promise<Tag[]> {
    const searchParams = new URLSearchParams();
    searchParams.set("q", query);
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<Tag[]>(
      `${API_ROUTES.TAGS.SEARCH}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getAutoTags(lang?: string): Promise<AutoTagLabel[]> {
    const searchParams = new URLSearchParams();
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<AutoTagLabel[]>(
      `${API_ROUTES.TAGS.AUTO}?${searchParams.toString()}`,
      { revalidate: 300 }
    );
  },
};
