"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/features/auth";

interface ThumbnailWithCTAProps {
  thumbnailUrl: string;
  thumbnailAlt: string;
  videoId: string;
  title: string;
  locale?: "th" | "en";
}

export function ThumbnailWithCTA({
  thumbnailUrl,
  thumbnailAlt,
  videoId,
  title,
  locale = "th",
}: ThumbnailWithCTAProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
      <Image
        src={thumbnailUrl}
        alt={thumbnailAlt || title}
        fill
        priority
        fetchPriority="high"
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      />

      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
        <LoginDialog locale={locale}>
          <Button
            size="lg"
            className="gap-2 rounded-full px-6 py-6"
          >
            <Play className="h-6 w-6 fill-current" />
            <span className="text-lg font-semibold">
              {locale === "th" ? "ดูวิดีโอ" : "Watch Video"}
            </span>
          </Button>
        </LoginDialog>
      </div>
    </div>
  );
}
