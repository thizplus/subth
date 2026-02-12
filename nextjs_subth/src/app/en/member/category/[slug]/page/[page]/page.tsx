import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import { categoryService } from "@/features/category";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { notFound, redirect } from "next/navigation";

const ITEMS_PER_PAGE = 30;

interface PageProps {
  params: Promise<{ slug: string; page: string }>;
}

export default async function PaginatedCategoryPage({ params }: PageProps) {
  const { slug, page } = await params;
  const currentPage = Number(page) || 1;

  if (currentPage === 1) {
    redirect(`/en/member/category/${slug}`);
  }

  const dict = await getDictionary("en");

  // Get category info
  let category = null;
  try {
    const categories = await categoryService.getList("en");
    category = categories.find((c) => c.slug === slug);
  } catch (e) {
    console.error("Failed to fetch category:", e);
  }

  if (!category) {
    notFound();
  }

  let videos: VideoListItem[] = [];
  let totalVideos = 0;
  let totalPages = 1;

  try {
    const response = await videoService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "en",
      sort: "date",
      order: "desc",
      category: slug,
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
          {category.name}{" "}
          <span className="text-muted-foreground">
            ({category.videoCount.toLocaleString()})
          </span>
        </h1>
        <VideoGrid videos={videos} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/en/member/category/${slug}`}
        />
      </section>
    </div>
  );
}
