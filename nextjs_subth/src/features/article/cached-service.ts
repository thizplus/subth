import { cache } from "react";
import { articleService } from "./service";
import type { Article } from "./types";

/**
 * Cached article fetcher using React cache()
 *
 * React cache() จะ dedupe calls ภายใน request เดียวกัน
 * ทำให้ generateMetadata และ page component ใช้ data เดียวกัน
 * ลดจาก 2 API calls เหลือ 1 call
 *
 * Note: API returns same endpoint for V2/V3, detect version using isV3Content()
 */
export const getArticleByTypeAndSlug = cache(
  async (type: string, slug: string, lang?: string): Promise<Article> => {
    return articleService.getByTypeAndSlug(type, slug, lang);
  }
);
