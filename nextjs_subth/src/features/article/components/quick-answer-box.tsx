"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAnswerBoxProps {
  quickAnswer: string;
  verdict: string;
  rating: number; // 1-5 scale (V3 uses 1-5 directly)
  className?: string;
}

export function QuickAnswerBox({
  quickAnswer,
  verdict,
  rating,
  className,
}: QuickAnswerBoxProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div
      className={cn(
        "p-5 border rounded-xl bg-card shadow-sm mb-6",
        className
      )}
    >
      {/* Quick Answer */}
      <p className="text-lg leading-relaxed mb-4">{quickAnswer}</p>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex">
          {Array.from({ length: fullStars }).map((_, i) => (
            <Star
              key={`full-${i}`}
              className="h-5 w-5 fill-yellow-400 text-yellow-400"
            />
          ))}
          {hasHalfStar && (
            <div className="relative">
              <Star className="h-5 w-5 text-muted-foreground/30" />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          )}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <Star
              key={`empty-${i}`}
              className="h-5 w-5 text-muted-foreground/30"
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {rating.toFixed(1)} / 5
        </span>
      </div>

      {/* Verdict (soft) */}
      <p className="text-sm text-muted-foreground italic">{verdict}</p>
    </div>
  );
}
