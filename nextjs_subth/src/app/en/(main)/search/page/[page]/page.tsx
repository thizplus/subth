import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ITEMS_PER_PAGE = 30;

interface PageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function PaginatedSearchPage({ params, searchParams }: PageProps) {
  const { page } = await params;
  const sp = await searchParams;
  const currentPage = Number(page) || 1;
  const searchQuery = sp.q || "";

  if (currentPage === 1) {
    redirect(`/search?q=${encodeURIComponent(searchQuery)}`);
  }

  const dict = await getDictionary("en");

  let videos: VideoListItem[] = [];
  let totalVideos = 0;
  let totalPages = 1;

  if (searchQuery) {
    try {
      const response = await videoService.search(searchQuery, {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        lang: "en",
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
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/"
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
          basePath="/search"
        />
      </div>

      <p className="text-muted-foreground mb-4">
        {dict.search.found} {totalVideos.toLocaleString()} {dict.search.results} &quot;{searchQuery}&quot;
      </p>

      {videos.length > 0 ? (
        <>
          <VideoGrid videos={videos} />
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
    </div>
  );
}
