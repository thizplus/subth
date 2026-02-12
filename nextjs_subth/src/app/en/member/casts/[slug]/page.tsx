import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import { castService } from "@/features/cast/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import { notFound } from "next/navigation";

const ITEMS_PER_PAGE = 30;

// Generate color from string
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CastDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dict = await getDictionary("en");

  // Get cast info
  let cast = null;
  try {
    cast = await castService.getBySlug(slug, "en");
  } catch (e) {
    console.error("Failed to fetch cast:", e);
  }

  if (!cast) {
    notFound();
  }

  let videos: VideoListItem[] = [];
  let totalVideos = 0;
  let totalPages = 1;

  try {
    const response = await videoService.getByCast(cast.id, {
      page: 1,
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
        {/* Cast Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: stringToColor(slug) }}
          >
            {cast.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{cast.name}</h1>
            <p className="text-sm text-muted-foreground">
              {totalVideos.toLocaleString()} {dict.cast.videos}
            </p>
          </div>
        </div>

        <VideoGrid videos={videos} />
        <Pagination
          currentPage={1}
          totalPages={totalPages}
          basePath={`/en/member/casts/${slug}`}
        />
      </section>
    </div>
  );
}
