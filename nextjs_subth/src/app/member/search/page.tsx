import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { PageActivityLogger } from "@/features/activity";

const ITEMS_PER_PAGE = 30;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
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

  return (
    <div>
      {/* Activity Logger - บันทึก search query ใน metadata */}
      {searchQuery && (
        <PageActivityLogger pageType="search" metadata={{ query: searchQuery }} />
      )}

      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/member"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label={dict.common.back}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">{dict.common.search}</h1>
      </div>

      <div className="mb-6">
        <SearchInput
          placeholder={dict.search.placeholder}
          defaultValue={searchQuery}
          basePath="/member/search"
        />
      </div>

      {searchQuery ? (
        <>
          <p className="text-muted-foreground mb-4">
            พบ {totalVideos.toLocaleString()} ผลลัพธ์สำหรับ "{searchQuery}"
          </p>

          {videos.length > 0 ? (
            <>
              <VideoGrid videos={videos} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/member/search"
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
        <p className="text-center text-muted-foreground py-8">
          พิมพ์คำค้นหาเพื่อค้นหาวิดีโอ
        </p>
      )}
    </div>
  );
}
