"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface DoubleTapHeartProps {
  show: boolean;
  className?: string;
}

/**
 * DoubleTapHeart - Large heart animation on double-tap
 */
export function DoubleTapHeart({ show, className }: DoubleTapHeartProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none z-30",
        className
      )}
    >
      <Heart className="h-32 w-32 text-reels-action-active fill-current heart-animation" />
    </div>
  );
}
