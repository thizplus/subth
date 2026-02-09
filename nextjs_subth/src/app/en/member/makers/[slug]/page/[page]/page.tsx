import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import { makerService } from "@/features/maker/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { notFound, redirect } from "next/navigation";

const ITEMS_PER_PAGE = 24;

interface PageProps {
  params: Promise<{ slug: string; page: string }>;
}

export default async function PaginatedMakerDetailPage({ params }: PageProps) {
  const { slug, page } = await params;
  const currentPage = Number(page) || 1;

  if (currentPage === 1) {
    redirect(`/en/member/makers/${slug}`);
  }

  const dict = await getDictionary("en");

  // Get maker info
  let maker = null;
  try {
    maker = await makerService.getBySlug(slug);
  } catch (e) {
    console.error("Failed to fetch maker:", e);
  }

  if (!maker) {
    notFound();
  }

  let videos: VideoListItem[] = [];
  let totalVideos = 0;
  let totalPages = 1;

  try {
    const response = await videoService.getByMaker(maker.id, {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "en",
    });
    videos = response.data;
    totalVideos = response.meta.total;
    totalPages = Math.ceil(totalVideos / ITEMS_PER_PAGE);
  } catch (e) {
    console.error("Failed to fetch videos:", e);
  }

  return (
    <div>
      <section>
        <h1 className="text-2xl font-semibold mb-4">
          {maker.name}{" "}
          <span className="text-muted-foreground">
            ({totalVideos.toLocaleString()})
          </span>
        </h1>
        <VideoGrid videos={videos} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/en/member/makers/${slug}`}
        />
      </section>
    </div>
  );
}
