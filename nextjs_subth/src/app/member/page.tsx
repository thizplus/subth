import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { CategoryWithVideos } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function HomePage() {
  const dict = await getDictionary("th");

  let categoryGroups: CategoryWithVideos[] = [];

  try {
    categoryGroups = await videoService.getByCategories({
      limit: 6,
      lang: "th",
    });
  } catch (e) {
    console.error("Failed to fetch videos by categories:", e);
  }

  return (
    <div className="space-y-6">
      {categoryGroups.map((group, index) => (
        <section key={group.category.id}>
          {index > 0 && <Separator className="mb-6" />}
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
          <VideoGrid videos={group.videos} cols={6} />
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
