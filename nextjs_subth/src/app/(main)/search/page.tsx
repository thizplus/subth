import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { PageActivityLogger } from "@/features/activity";
import { SearchPageClient } from "./search-client";
import type { Metadata } from "next";

const ITEMS_PER_PAGE = 30;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q;

  if (q) {
    return {
      title: `ค้นหา "${q}" - SubTH`,
      description: `ผลการค้นหา JAV ซับไทย สำหรับ "${q}"`,
    };
  }

  return {
    title: "ค้นหา JAV ซับไทย - SubTH",
    description: "ค้นหา JAV ซับไทย ตามชื่อ รหัส นักแสดง ค่าย",
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dict = await getDictionary("th");
  const searchQuery = params.q || "";
  const currentPage = 1;

  let videos: VideoListItem[] = [];
  let totalVideos = 0;
  let totalPages = 1;

  if (searchQuery) {
    try {
      const response = await videoService.search(searchQuery, {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        lang: "th",
      });
      videos = response.data;
      totalVideos = response.meta.total;
      totalPages = Math.ceil(totalVideos / ITEMS_PER_PAGE);
    } catch (e) {
      console.error("Failed to search videos:", e);
    }
  }

  // ถ้าไม่มี query → แสดงเรื่องแนะนำ 10 เรื่อง
  let recommended: VideoListItem[] = [];
  if (!searchQuery) {
    try {
      const response = await videoService.getList({
        limit: 10,
        page: 1,
        lang: "th",
        sort: "views",
        order: "desc",
        category: "censored-jav",
      });
      recommended = response.data || [];
    } catch (e) {
      console.error("Failed to fetch recommended:", e);
    }
  }

  return (
    <div>
      {searchQuery && (
        <PageActivityLogger pageType="search" metadata={{ query: searchQuery }} />
      )}

      {searchQuery ? (
        <>
          {/* มี query → แสดงผลลัพธ์ */}
          <h1 className="text-2xl font-bold mb-4">{dict.common.search}</h1>

          <div className="mb-6">
            <SearchPageClient locale="th" defaultValue={searchQuery} />
          </div>

          <p className="text-muted-foreground mb-4">
            {dict.search.found} {totalVideos.toLocaleString()} {dict.search.results} &quot;{searchQuery}&quot;
          </p>

          {videos.length > 0 ? (
            <>
              <VideoGrid videos={videos} cols={5} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/search"
                searchQuery={searchQuery}
              />
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {dict.common.noResults}
            </p>
          )}
        </>
      ) : (
        <>
          {/* ไม่มี query → หน้า search สวยๆ */}
          <div className="flex flex-col items-center pt-8 pb-10">
            <h1 className="text-3xl font-bold mb-2">{dict.common.search}</h1>
            <p className="text-muted-foreground mb-6">{dict.search.prompt}</p>

            <div className="w-full max-w-lg">
              <SearchPageClient locale="th" />
            </div>
          </div>

          {/* เรื่องแนะนำ */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              {dict.search.recommended}
            </h2>
            <VideoGrid videos={recommended} cols={5} />
          </section>
        </>
      )}
    </div>
  );
}
