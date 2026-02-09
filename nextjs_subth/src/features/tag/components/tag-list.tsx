import Link from "next/link";
import type { Tag } from "../types";

interface TagListProps {
  tags: Tag[];
  locale?: string;
}

export function TagList({ tags, locale = "th" }: TagListProps) {
  const basePath = locale === "en" ? "/en/member" : "/member";

  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tags found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`${basePath}/tags/${tag.slug}`}
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
        >
          <span className="font-medium">{tag.name}</span>
          {tag.videoCount !== undefined && (
            <span className="text-sm text-muted-foreground">
              {tag.videoCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
