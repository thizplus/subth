import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  score: number; // 1-10 scale
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  score,
  showScore = true,
  size = "md",
  className,
}: StarRatingProps) {
  // Convert 1-10 to 5 stars (e.g., 8 = 4 stars)
  const stars = Math.round(score / 2);
  const fullStars = Math.min(stars, 5);
  const emptyStars = 5 - fullStars;

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
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
          {score}/10
        </span>
      )}
    </div>
  );
}
