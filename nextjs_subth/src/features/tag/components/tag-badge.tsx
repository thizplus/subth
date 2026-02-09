import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Tag } from "../types";

interface TagBadgeProps {
  tag: Tag;
  locale?: string;
  showCount?: boolean;
}

export function TagBadge({ tag, locale = "th", showCount = false }: TagBadgeProps) {
  const basePath = locale === "en" ? "/en/member" : "/member";
  return (
    <Link href={`${basePath}/tags/${tag.slug}`}>
      <Badge
        variant="secondary"
        className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
      >
        {tag.name}
        {showCount && tag.videoCount !== undefined && (
          <span className="ml-1 text-xs opacity-70">({tag.videoCount})</span>
        )}
      </Badge>
    </Link>
  );
}
