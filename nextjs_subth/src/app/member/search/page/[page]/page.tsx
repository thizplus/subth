import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { redirect } from "next/navigation";

const ITEMS_PER_PAGE = 30;

interface PageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function PaginatedSearchPage({ params, searchParams }: PageProps) {
  const { page } = await params;
  const sp = await searchParams;
  const dict = await getDictionary("th");
  const searchQuery = sp.q || "";
  const currentPage = Number(page) || 1;

  // ถ้าไม่มี query redirect กลับหน้า search
  if (!searchQuery) {
    redirect("/member/search");
  }

  // ถ้าเป็นหน้า 1 redirect ไปหน้าแรก
  if (currentPage === 1) {
    redirect(`/member/search?q=${encodeURIComponent(searchQuery)}`);
  }

  let videos: VideoListItem[] = [];
  let totalVideos = 0;
  let totalPages = 1;

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{dict.common.search}</h1>

      <div className="mb-6">
        <SearchInput
          placeholder={dict.search.placeholder}
          defaultValue={searchQuery}
          basePath="/member/search"
        />
      </div>

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
    </div>
  );
}
