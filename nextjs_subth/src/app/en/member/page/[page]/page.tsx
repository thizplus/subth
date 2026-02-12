import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { redirect } from "next/navigation";

const ITEMS_PER_PAGE = 30;

interface PageProps {
  params: Promise<{ page: string }>;
}

export default async function PaginatedEnglishHomePage({ params }: PageProps) {
  const { page } = await params;
  const currentPage = Number(page) || 1;

  // Redirect page 1 to root
  if (currentPage === 1) {
    redirect("/en/member");
  }

  const dict = await getDictionary("en");

  let latestVideos: VideoListItem[] = [];
  let totalPages = 1;
  let totalVideos = 0;

  try {
    const response = await videoService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "en",
      sort: "date",
      order: "desc",
    });
    latestVideos = response.data;
    totalVideos = response.meta.total;
    totalPages = Math.ceil(totalVideos / ITEMS_PER_PAGE);
  } catch (e) {
    console.error("Failed to fetch videos:", e);
  }

  return (
    <div>
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          {dict.home.latest}{" "}
          <span className="text-muted-foreground">
            ({totalVideos.toLocaleString()})
          </span>
        </h2>
        <VideoGrid videos={latestVideos} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/en/member"
        />
      </section>
    </div>
  );
}
