"use client";

import Image from "next/image";
import Link from "next/link";
import { useDictionary } from "@/components/dictionary-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { VideoListItem } from "../types";

interface VideoCardProps {
  video: VideoListItem;
}

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "https://files.subth.com";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

function formatDate(dateString?: string | null, locale?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);

  if (locale === "th") {
    const day = date.getDate();
    const month = THAI_MONTHS[date.getMonth()];
    const year = date.getFullYear() + 543; // พ.ศ.
    return `${day} ${month} ${year}`;
  }

  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
}

function isToday(dateString?: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function VideoCard({ video }: VideoCardProps) {
  const { getLocalizedPath, locale } = useDictionary();
  const thumbnailUrl = video.thumbnail?.startsWith("http")
    ? video.thumbnail
    : video.thumbnail
    ? `${CDN_URL}${video.thumbnail}`
    : "/placeholder-video.jpg";

  // Check if title has "และอีก X คน"
  const morePattern = /และอีก \d+ คน/;
  const hasMoreCasts = video.title && morePattern.test(video.title);
  const allCastNames = video.casts?.map((c) => c.name).join(", ");

  // Render title with tooltip for "และอีก X คน"
  const renderTitle = () => {
    if (!hasMoreCasts || !allCastNames) {
      return video.title;
    }

    const match = video.title.match(morePattern);
    if (!match) return video.title;

    const beforeMore = video.title.slice(0, match.index);
    const moreText = match[0];

    return (
      <>
        {beforeMore}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="underline decoration-dotted cursor-help">
              {moreText}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">นักแสดงทั้งหมด:</p>
            <p>{allCastNames}</p>
          </TooltipContent>
        </Tooltip>
      </>
    );
  };

  return (
    <Link href={getLocalizedPath(`/videos/${video.id}`)} className="group">
      <div className="overflow-hidden">
        <div className="relative aspect-video">
          <Image
            src={thumbnailUrl}
            alt={video.title || "Video"}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </div>
      <div className="pt-2">
        <p className="font-medium line-clamp-2" title={video.title}>
          {renderTitle()}
        </p>
        {video.releaseDate && (
          <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            {formatDate(video.releaseDate, locale)}
            {isToday(video.releaseDate) && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                {locale === "th" ? "ใหม่" : "NEW"}
              </Badge>
            )}
          </span>
        )}
      </div>
    </Link>
  );
}
