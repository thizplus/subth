import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 1-5 scale
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  rating,
  showScore = true,
  size = "md",
  className,
}: StarRatingProps) {
  // rating is already 1-5 scale
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")}
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star
              className={cn(sizeClasses[size], "text-muted-foreground/30")}
            />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star
                className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")}
              />
            </div>
          </div>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(sizeClasses[size], "text-muted-foreground/30")}
          />
        ))}
      </div>
      {showScore && (
        <span className={cn(textClasses[size], "text-muted-foreground")}>
          {rating.toFixed(1).replace(/\.0$/, "")}/5
        </span>
      )}
    </div>
  );
}
