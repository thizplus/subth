import { videoService } from "@/features/video/service";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CDN_URL } from "@/lib/constants";
import { VideoActivityLogger } from "@/features/activity";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatEnglishDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dict = await getDictionary("en");

  let video;
  try {
    video = await videoService.getById(id, "en");
  } catch {
    notFound();
  }

  if (!video) {
    notFound();
  }

  // Get video code from title (e.g., "RBD-856 ..." -> "RBD-856")
  const videoCode = video.title.split(" ")[0];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Activity Logger - Fire & Forget */}
      <VideoActivityLogger videoId={video.id} />

      {/* Video Player Area */}
      <div className="relative aspect-video w-full mb-6 bg-muted rounded-lg overflow-hidden">
        {video.embedUrl ? (
          <iframe
            src={video.embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted-foreground">Processing...</span>
          </div>
        )}
      </div>

      {/* Content: 2 columns 50/50 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Thumbnail (50%) */}
        <div>
          <Image
            src={video.thumbnail ? `${CDN_URL}${video.thumbnail}` : `${CDN_URL}/thumbnails/${videoCode}.jpg`}
            alt={video.title}
            width={800}
            height={538}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Right: Info (50%) */}
        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-xl font-bold">{video.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {video.releaseDate && (
              <span>{formatEnglishDate(video.releaseDate)}</span>
            )}
            {video.categories && video.categories.length > 0 && (
              <>
                <span>•</span>
                {video.categories.map((cat, idx) => (
                  <span key={cat.id}>
                    <Link href={`/en/member/category/${cat.slug}`} className="hover:underline">
                      {cat.name}
                    </Link>
                    {idx < video.categories!.length - 1 && ", "}
                  </span>
                ))}
              </>
            )}
          </div>

          {/* Maker */}
          {video.maker && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-1">{dict.video.maker}</h2>
              <Link
                href={`/en/member/makers/${video.maker.slug}`}
                className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full hover:bg-secondary/80 transition-colors"
              >
                {video.maker.name}
              </Link>
            </div>
          )}

          {/* Casts */}
          {video.casts && video.casts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-1">{dict.video.cast}</h2>
              <div className="flex flex-wrap gap-1">
                {video.casts.map((cast) => (
                  <Link
                    key={cast.id}
                    href={`/en/member/casts/${cast.slug}`}
                    className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded-full hover:bg-secondary/80 transition-colors"
                  >
                    {cast.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-1">{dict.video.tags}</h2>
              <div className="flex flex-wrap gap-1">
                {video.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/en/member/tags/${tag.slug}`}
                    className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded-full hover:bg-muted/80 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
