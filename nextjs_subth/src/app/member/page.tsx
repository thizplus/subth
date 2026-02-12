import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { CategoryWithVideos } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function HomePage() {
  const dict = await getDictionary("th");

  let categoryGroups: CategoryWithVideos[] = [];

  try {
    categoryGroups = await videoService.getByCategories({
      limit: 10,
      categories: 3,
      lang: "th",
    });
  } catch (e) {
    console.error("Failed to fetch videos by categories:", e);
  }

  return (
    <div className="space-y-8">
      {categoryGroups.map((group) => (
        <section key={group.category.id}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              {group.category.name}{" "}
              <span className="text-muted-foreground">
                ({group.category.videoCount.toLocaleString()})
              </span>
            </h2>
            <Link
              href={`/member/category/${group.category.slug}`}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {dict.common.viewAll}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <VideoGrid videos={group.videos} />
        </section>
      ))}

      {categoryGroups.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {dict.common.noData}
        </div>
      )}
    </div>
  );
}
