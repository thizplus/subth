import { VideoCard } from "./video-card";
import { VideoCardSkeleton } from "./video-card-skeleton";
import type { VideoListItem } from "../types";

interface VideoGridProps {
  videos?: VideoListItem[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export function VideoGrid({
  videos,
  isLoading = false,
  skeletonCount = 8,
}: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
