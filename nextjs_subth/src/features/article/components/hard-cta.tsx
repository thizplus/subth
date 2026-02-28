"use client";

import Link from "next/link";
import { Play, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";

interface HardCTAProps {
  videoId: string;
  className?: string;
}

export function HardCTA({ videoId, className }: HardCTAProps) {
  const { t, getLocalizedPath } = useDictionary();

  const benefits = [
    "ซับไทยคุณภาพ",
    "อัพเดททุกวัน",
    "ไม่มีโฆษณา",
  ];

  return (
    <div
      className={cn(
        "my-8 p-6 rounded-2xl bg-card border shadow-sm",
        className
      )}
    >
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">
          {t("common.allVideos")}
        </h3>

        <div className="flex flex-wrap justify-center gap-3">
          {benefits.map((benefit, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              {benefit}
            </span>
          ))}
        </div>

        <Link
          href={getLocalizedPath(`/member/videos/${videoId}`)}
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          <Play className="h-5 w-5" />
          {t("common.watchVideo")}
        </Link>
      </div>
    </div>
  );
}
