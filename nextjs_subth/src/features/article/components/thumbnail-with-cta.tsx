"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { useDictionary } from "@/components/dictionary-provider";

interface ThumbnailWithCTAProps {
  thumbnailUrl: string;
  thumbnailAlt: string;
  videoId: string;
  title: string;
}

export function ThumbnailWithCTA({
  thumbnailUrl,
  thumbnailAlt,
  videoId,
  title,
}: ThumbnailWithCTAProps) {
  const { isAuthenticated } = useAuthStore();
  const { t, locale, getLocalizedPath } = useDictionary();
  const videoPath = getLocalizedPath(`/member/videos/${videoId}`);
  const buttonText = t("common.watchVideo");

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
        {isAuthenticated ? (
          <Button size="lg" className="gap-2 rounded-full px-6 py-6" asChild>
            <Link href={videoPath}>
              <Play className="h-6 w-6 fill-current" />
              <span className="text-lg font-semibold">{buttonText}</span>
            </Link>
          </Button>
        ) : (
          <LoginDialog locale={locale as "th" | "en"}>
            <Button size="lg" className="gap-2 rounded-full px-6 py-6">
              <Play className="h-6 w-6 fill-current" />
              <span className="text-lg font-semibold">{buttonText}</span>
            </Button>
          </LoginDialog>
        )}
      </div>
    </div>
  );
}
