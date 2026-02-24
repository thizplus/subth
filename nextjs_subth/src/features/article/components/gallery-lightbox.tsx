"use client";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";

interface GalleryLightboxProps {
  open: boolean;
  onClose: () => void;
  index: number;
  slides: { src: string; alt: string; width: number; height: number }[];
}

/**
 * GalleryLightbox - Dynamically imported lightbox component
 * แยก component เพื่อให้ code-split ได้ (~50KB)
 */
export function GalleryLightbox({ open, onClose, index, slides }: GalleryLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom, Thumbnails, Counter]}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
      }}
      thumbnails={{
        position: "bottom",
        width: 100,
        height: 60,
        gap: 8,
      }}
      counter={{
        container: { style: { top: 0, bottom: "unset" } },
      }}
      carousel={{
        finite: false,
      }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
      }}
    />
  );
}
