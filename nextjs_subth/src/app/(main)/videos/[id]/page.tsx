import { videoService } from "@/features/video/service";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CDN_URL } from "@/lib/constants";
import { VideoActivityLogger } from "@/features/activity";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Format date สำหรับภาษาไทย
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

function formatThaiDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

// Dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const video = await videoService.getById(id, "th");
    if (!video) return {};

    const videoCode = video.title.split(" ")[0];
    const castNames = video.casts?.map((c) => c.name).join(", ") || "";
    const makerName = video.maker?.name || "";
    const categoryNames = video.categories?.map((c) => c.name).join(", ") || "";

    const title = `${video.title} | ดู JAV ซับไทย`;
    const description = `ดู ${videoCode} ซับไทย${castNames ? ` นำแสดงโดย ${castNames}` : ""}${makerName ? ` จากค่าย ${makerName}` : ""} พร้อมข้อมูลครบ`;

    const thumbnailUrl = video.thumbnail
      ? `${CDN_URL}${video.thumbnail}`
      : `${CDN_URL}/thumbnails/${videoCode}.jpg`;

    return {
      title,
      description,
      keywords: [
        `${videoCode} ซับไทย`,
        videoCode,
        ...video.casts?.map((c) => c.name) || [],
        makerName,
        "jav ซับไทย",
      ].filter(Boolean),
      openGraph: {
        title,
        description,
        url: `https://subth.com/videos/${id}`,
        type: "video.other",
        siteName: "SubTH",
        images: [
          {
            url: thumbnailUrl,
            width: 800,
            height: 538,
            alt: video.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [thumbnailUrl],
      },
      alternates: {
        canonical: `https://subth.com/videos/${id}`,
      },
    };
  } catch {
    return {};
  }
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dict = await getDictionary("th");

  let video;
  try {
    video = await videoService.getById(id, "th");
  } catch {
    notFound();
  }

  if (!video) {
    notFound();
  }

  // ดึง video code จาก title (เช่น "RBD-856 ..." -> "RBD-856")
  const videoCode = video.title.split(" ")[0];

  // VideoObject Schema for SEO
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: `${videoCode} ซับไทย${video.casts?.length ? ` - ${video.casts.map((c) => c.name).join(", ")}` : ""}`,
    thumbnailUrl: video.thumbnail
      ? `${CDN_URL}${video.thumbnail}`
      : `${CDN_URL}/thumbnails/${videoCode}.jpg`,
    uploadDate: video.createdAt,
    ...(video.releaseDate && { datePublished: video.releaseDate }),
    publisher: {
      "@type": "Organization",
      name: "SubTH",
      url: "https://subth.com",
    },
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />

      {/* Activity Logger - Fire & Forget */}
      <VideoActivityLogger videoId={video.id} />

      {/* Video Player Area */}
      <div className="relative aspect-video w-full mb-6 bg-muted overflow-hidden">
        {video.embedUrl ? (
          <iframe
            src={video.embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted-foreground">กำลังประมวลผล...</span>
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
            fetchPriority="high"
          />
        </div>

        {/* Right: Info (50%) */}
        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-xl font-bold">{video.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {video.releaseDate && (
              <span>{formatThaiDate(video.releaseDate)}</span>
            )}
            {video.categories && video.categories.length > 0 && (
              <>
                <span>•</span>
                {video.categories.map((cat, idx) => (
                  <span key={cat.id}>
                    <Link href={`/category/${cat.slug}`} className="hover:underline">
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
                href={`/makers/${video.maker.slug}`}
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
                    href={`/casts/${cast.slug}`}
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
                    href={`/tags/${tag.slug}`}
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
