import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import { tagService } from "@/features/tag/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { notFound, redirect } from "next/navigation";

const ITEMS_PER_PAGE = 30;

interface PageProps {
  params: Promise<{ slug: string; page: string }>;
}

export default async function PaginatedTagDetailPage({ params }: PageProps) {
  const { slug, page } = await params;
  const currentPage = Number(page) || 1;

  if (currentPage === 1) {
    redirect(`/en/member/tags/${slug}`);
  }

  const dict = await getDictionary("en");

  // Get tag info
  let tag = null;
  try {
    tag = await tagService.getBySlug(slug, "en");
  } catch (e) {
    console.error("Failed to fetch tag:", e);
  }

  if (!tag) {
    notFound();
  }

  let videos: VideoListItem[] = [];
  let totalVideos = 0;
  let totalPages = 1;

  try {
    const response = await videoService.getByTag(tag.id, {
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
          {tag.name}{" "}
          <span className="text-muted-foreground">
            ({totalVideos.toLocaleString()})
          </span>
        </h1>
        <VideoGrid videos={videos} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/en/member/tags/${slug}`}
        />
      </section>
    </div>
  );
}
