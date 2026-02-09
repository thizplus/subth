import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type { Category } from "./types";

export const categoryService = {
  async getList(lang?: string): Promise<Category[]> {
    const searchParams = new URLSearchParams();
    if (lang) searchParams.set("lang", lang);

    return apiClient.serverGet<Category[]>(
      `${API_ROUTES.CATEGORIES.LIST}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },
};
