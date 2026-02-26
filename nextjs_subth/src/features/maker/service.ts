import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type {
  Maker,
  MakerDetail,
  MakerListParams,
  MakerListResponse,
} from "./types";

export const makerService = {
  async getList(params?: MakerListParams): Promise<MakerListResponse> {
    const limit = params?.limit || 24;
    const page = params?.page || 1;

    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(limit));
    searchParams.set("page", String(page));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.hasArticles) searchParams.set("hasArticles", "true");
    // Note: Makers ไม่รองรับ lang parameter

    return apiClient.serverGetRaw<MakerListResponse>(
      `${API_ROUTES.MAKERS.LIST}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  async getById(id: string): Promise<MakerDetail> {
    return apiClient.serverGet<MakerDetail>(
      API_ROUTES.MAKERS.BY_SLUG(id),
      { revalidate: 60 }
    );
  },

  async getBySlug(slug: string): Promise<MakerDetail> {
    return apiClient.serverGet<MakerDetail>(
      API_ROUTES.MAKERS.BY_SLUG(slug),
      { revalidate: 60 }
    );
  },

  async getTop(limit: number = 10): Promise<Maker[]> {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(limit));

    return apiClient.serverGet<Maker[]>(
      `${API_ROUTES.MAKERS.TOP}?${searchParams.toString()}`,
      { revalidate: 300 }
    );
  },

  async search(query: string): Promise<Maker[]> {
    const searchParams = new URLSearchParams();
    searchParams.set("q", query);

    return apiClient.serverGet<Maker[]>(
      `${API_ROUTES.MAKERS.SEARCH}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },
};
