import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import { makerService } from "@/features/maker/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const ITEMS_PER_PAGE = 30;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const maker = await makerService.getBySlug(slug);
    if (!maker) return {};
    return {
      title: `${maker.name} - JAV ซับไทย | SubTH`,
      description: `ดู JAV ซับไทย จากค่าย ${maker.name} ทั้งหมด`,
      alternates: { canonical: `https://subth.com/makers/${slug}` },
    };
  } catch {
    return {};
  }
}

export default async function MakerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dict = await getDictionary("th");

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
      page: 1,
      limit: ITEMS_PER_PAGE,
      lang: "th",
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
          currentPage={1}
          totalPages={totalPages}
          basePath={`/makers/${slug}`}
        />
      </section>
    </div>
  );
}
