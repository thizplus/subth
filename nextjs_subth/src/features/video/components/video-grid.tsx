import { VideoCard } from "./video-card";
import { VideoCardSkeleton } from "./video-card-skeleton";
import type { VideoListItem } from "../types";

interface VideoGridProps {
  videos?: VideoListItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  cols?: 5 | 6;
}

const gridColsClass = {
  5: "grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3",
  6: "grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3",
};

export function VideoGrid({
  videos,
  isLoading = false,
  skeletonCount = 8,
  cols = 5,
}: VideoGridProps) {
  const gridClass = gridColsClass[cols];

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        ไม่พบวิดีโอ
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
