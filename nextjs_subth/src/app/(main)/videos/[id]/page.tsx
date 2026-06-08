import { videoService } from "@/features/video/service";
import { semanticSearchService } from "@/features/semantic-search";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CDN_URL } from "@/lib/constants";
import { VideoActivityLogger } from "@/features/activity";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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
        locale: "th_TH",
        alternateLocale: ["en_US"],
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
        languages: {
          "th": `https://subth.com/videos/${id}`,
          "en": `https://subth.com/en/videos/${id}`,
        },
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
    ...(video.embedUrl && { embedUrl: video.embedUrl }),
    ...(video.duration && video.duration > 0 && {
      duration: `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`,
    }),
    ...(video.views != null && {
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WatchAction",
        userInteractionCount: video.views,
      },
    }),
    inLanguage: "th",
    publisher: {
      "@type": "Organization",
      name: "SubTH",
      url: "https://subth.com",
    },
  };

  // BreadcrumbList Schema for SEO
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "หน้าแรก",
        item: "https://subth.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "วิดีโอ",
        item: "https://subth.com",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: video.title,
        item: `https://subth.com/videos/${id}`,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([videoSchema, breadcrumbSchema]) }}
      />

      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">{dict.common.home}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">{dict.common.videos}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1 max-w-[200px] sm:max-w-[400px]">{videoCode}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Activity Logger - Fire & Forget */}
      <VideoActivityLogger videoId={video.id} />

      {/* Content: 2 columns 50/50 on desktop — Thumbnail + Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left: Thumbnail (50%) */}
        <div>
          <Image
            src={video.thumbnail ? `${CDN_URL}${video.thumbnail}` : `${CDN_URL}/thumbnails/${videoCode}.jpg`}
            alt={video.title}
            width={800}
            height={538}
            className="w-full h-auto rounded-lg"
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

      {/* Video Player — ใต้เนื้อหา */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden rounded-lg">
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

      {/* Related Videos */}
      <RelatedVideos videoId={video.id} label={dict.video.related} />

      {/* Bottom spacing — ป้องกัน chat FAB บัง player */}
      <div className="h-24" />
    </div>
  );
}

async function RelatedVideos({ videoId, label }: { videoId: string; label: string }) {
  let videos: { id: string; title: string; thumbnail: string }[] = [];
  try {
    const result = await semanticSearchService.getSimilarVideos(videoId, 8);
    videos = result.videos || [];
  } catch {
    // Semantic service อาจยังไม่มี embedding สำหรับ video นี้
    return null;
  }

  if (videos.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">{label}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {videos.map((v) => (
          <Link key={v.id} href={`/videos/${v.id}`} className="group">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-muted">
              <Image
                src={v.thumbnail ? `${CDN_URL}${v.thumbnail}` : `${CDN_URL}/thumbnails/default.jpg`}
                alt={v.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            </div>
            <p className="mt-1 text-sm line-clamp-2 group-hover:text-primary transition-colors">{v.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
