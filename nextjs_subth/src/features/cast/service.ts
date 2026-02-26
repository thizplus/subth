import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type {
  Cast,
  CastDetail,
  CastListParams,
  CastListResponse,
} from "./types";

export const castService = {
  async getList(params?: CastListParams): Promise<CastListResponse> {
    const limit = params?.limit || 24;
    const page = params?.page || 1;

    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(limit));
    searchParams.set("page", String(page));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.lang) searchParams.set("lang", params.lang);
    if (params?.hasArticles) searchParams.set("hasArticles", "true");

    return apiClient.serverGetRaw<CastListResponse>(
      `${API_ROUTES.CASTS.LIST}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getById(id: string, lang?: string): Promise<CastDetail> {
    const searchParams = new URLSearchParams();
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<CastDetail>(
      `${API_ROUTES.CASTS.BY_ID(id)}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getBySlug(slug: string, lang?: string): Promise<CastDetail> {
    const searchParams = new URLSearchParams();
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<CastDetail>(
      `${API_ROUTES.CASTS.BY_SLUG(slug)}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getTop(limit: number = 10, lang?: string): Promise<Cast[]> {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(limit));
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<Cast[]>(
      `${API_ROUTES.CASTS.TOP}?${searchParams.toString()}`,
      { revalidate: 300 }
    );
  },

  async search(query: string, lang?: string): Promise<Cast[]> {
    const searchParams = new URLSearchParams();
    searchParams.set("q", query);
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<Cast[]>(
      `${API_ROUTES.CASTS.SEARCH}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },
};
