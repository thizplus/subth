"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { useDictionary } from "@/components/dictionary-provider";
import { apiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/constants";

interface ThumbnailWithCTAProps {
  videoId: string;
  children: React.ReactNode; // Server-rendered image
}

interface VideoData {
  embedUrl?: string;
}

// Client Component - แสดง thumbnail หรือ video player
export function ThumbnailWithCTA({
  videoId,
  children,
}: ThumbnailWithCTAProps) {
  const { isAuthenticated } = useAuthStore();
  const { t, locale, getLocalizedPath } = useDictionary();
  const videoPath = getLocalizedPath(`/member/videos/${videoId}`);
  const buttonText = t("common.watchVideo");

  const [isLoading, setIsLoading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // Fetch video embedUrl when authenticated user clicks play
  const handlePlayClick = useCallback(async () => {
    if (!videoId || embedUrl) return;

    setIsLoading(true);
    setError(false);

    try {
      const video = await apiClient.get<VideoData>(API_ROUTES.VIDEOS.BY_ID(videoId));
      if (video.embedUrl) {
        setEmbedUrl(video.embedUrl);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [videoId, embedUrl]);

  // Show video player if embedUrl is loaded
  if (embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
      {/* Server-rendered image (จะอยู่ใน initial HTML) */}
      {children}

      {/* Client-side CTA overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
        {isAuthenticated ? (
          isLoading ? (
            <Button size="lg" className="gap-2 rounded-full px-6 py-6" disabled>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg font-semibold">{t("common.loading")}</span>
            </Button>
          ) : error ? (
            // Fallback to link if embed fails
            <Button size="lg" className="gap-2 rounded-full px-6 py-6" asChild>
              <Link href={videoPath}>
                <Play className="h-6 w-6 fill-current" />
                <span className="text-lg font-semibold">{buttonText}</span>
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              className="gap-2 rounded-full px-6 py-6"
              onClick={handlePlayClick}
            >
              <Play className="h-6 w-6 fill-current" />
              <span className="text-lg font-semibold">{buttonText}</span>
            </Button>
          )
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
