"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Images, Lock, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { useDictionary } from "@/components/dictionary-provider";
import type { GalleryImage } from "../types";

// Dynamic import Lightbox - โหลดเฉพาะเมื่อเปิด gallery (ลด initial bundle ~50KB)
const GalleryLightbox = dynamic(
  () => import("./gallery-lightbox").then((mod) => mod.GalleryLightbox),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        <div className="text-white text-sm">Loading gallery...</div>
      </div>
    ),
  }
);

interface GallerySectionProps {
  images: GalleryImage[];
  memberCount?: number;
  videoId: string;
  videoCode: string;
}

export function GallerySection({
  images,
  memberCount,
  videoId,
  videoCode,
}: GallerySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isAuthenticated } = useAuthStore();
  const { t, locale, getLocalizedPath } = useDictionary();
  const videoPath = getLocalizedPath(`/member/videos/${videoId}`);

  if (!images?.length) {
    return null;
  }

  const displayImages = images.slice(0, 10);

  // Convert images to lightbox format
  const slides = images.map((image, index) => ({
    src: image.url,
    alt: image.alt || `${videoCode} - ภาพที่ ${index + 1}`,
    width: image.width || 1280,
    height: image.height || 720,
  }));

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Images className="h-5 w-5 text-primary" />
        {t("article.gallery")}
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
          {images.length}
          {memberCount && memberCount > 0 ? `+${memberCount}` : ""}
        </span>
      </h2>

      {/* Image grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setLightboxOpen(true);
            }}
            className="group relative aspect-video overflow-hidden rounded-lg bg-muted"
          >
            <Image
              src={image.url}
              alt={image.alt || `${videoCode} - ภาพที่ ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              loading={index < 4 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
              <ZoomIn className="h-6 w-6 text-white" />
            </div>
          </button>
        ))}
      </div>

      {/* View more CTA */}
      {memberCount && memberCount > 0 && (
        <div className="flex justify-center pt-2">
          {isAuthenticated ? (
            <Button
              variant="outline"
              className="gap-2 rounded-full border-primary/30 hover:bg-primary/10"
              asChild
            >
              <Link href={videoPath}>
                <Images className="h-4 w-4" />
                {t("article.viewMoreImages").replace("{count}", String(memberCount))}
              </Link>
            </Button>
          ) : (
            <LoginDialog locale={locale as "th" | "en"}>
              <Button
                variant="outline"
                className="gap-2 rounded-full border-primary/30 hover:bg-primary/10"
              >
                <Lock className="h-4 w-4" />
                {t("article.viewMoreImages").replace("{count}", String(memberCount))}
              </Button>
            </LoginDialog>
          )}
        </div>
      )}

      {/* Lightbox - Dynamic import: โหลดเฉพาะเมื่อเปิด */}
      {lightboxOpen && (
        <GalleryLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          index={currentIndex}
          slides={slides}
        />
      )}
    </section>
  );
}
