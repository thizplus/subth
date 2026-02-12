import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";

const ITEMS_PER_PAGE = 30;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dict = await getDictionary("en");
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
      <h1 className="text-2xl font-bold mb-4">{dict.common.search}</h1>

      <div className="mb-6">
        <SearchInput
          placeholder={dict.search.placeholder}
          defaultValue={searchQuery}
          basePath="/en/member/search"
        />
      </div>

      {searchQuery ? (
        <>
          <p className="text-muted-foreground mb-4">
            Found {totalVideos.toLocaleString()} results for "{searchQuery}"
          </p>

          {videos.length > 0 ? (
            <>
              <VideoGrid videos={videos} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/en/member/search"
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
          Type a search query to find videos
        </p>
      )}
    </div>
  );
}
