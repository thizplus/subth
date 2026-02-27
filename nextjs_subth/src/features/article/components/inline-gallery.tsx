"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import type { GalleryImage } from "../types";

// Dynamic import Lightbox
const GalleryLightbox = dynamic(
  () => import("./gallery-lightbox").then((mod) => mod.GalleryLightbox),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        <div className="text-white text-sm">Loading...</div>
      </div>
    ),
  }
);

interface InlineGalleryProps {
  images: GalleryImage[];
  videoCode: string;
  /** จำนวนคอลัมน์: 1, 2, หรือ 3 */
  columns?: 1 | 2 | 3;
  /** Caption ใต้ภาพ */
  caption?: string;
  /** ClassName เพิ่มเติม */
  className?: string;
}

/**
 * InlineGallery - แสดงภาพ 1-3 รูปแทรกในเนื้อหา
 * ใช้สำหรับกระจายภาพไปตาม sections แทนที่จะรวมใน gallery
 */
export function InlineGallery({
  images,
  videoCode,
  columns = 2,
  caption,
  className = "",
}: InlineGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images?.length) {
    return null;
  }

  // จำกัดจำนวนภาพตาม columns
  const displayImages = images.slice(0, columns === 1 ? 1 : columns === 2 ? 2 : 3);

  const slides = displayImages.map((image, index) => ({
    src: image.url,
    alt: image.alt || `${videoCode} - ภาพที่ ${index + 1}`,
    width: image.width || 1280,
    height: image.height || 720,
  }));

  const gridClass = {
    1: "grid-cols-1 max-w-2xl mx-auto",
    2: "grid-cols-2",
    3: "grid-cols-3",
  }[columns];

  return (
    <figure className={`my-6 ${className}`}>
      <div className={`grid gap-2 ${gridClass}`}>
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
              sizes={columns === 1 ? "100vw" : columns === 2 ? "50vw" : "33vw"}
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
              <ZoomIn className="h-6 w-6 text-white" />
            </div>
          </button>
        ))}
      </div>

      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}

      {lightboxOpen && (
        <GalleryLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          index={currentIndex}
          slides={slides}
        />
      )}
    </figure>
  );
}
