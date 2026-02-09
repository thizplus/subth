import { TagBadge } from "./tag-badge";
import type { Tag } from "../types";

interface TagCloudProps {
  tags: Tag[];
  locale?: string;
  showCount?: boolean;
}

export function TagCloud({ tags, locale, showCount = true }: TagCloudProps) {
  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tags found
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} locale={locale} showCount={showCount} />
      ))}
    </div>
  );
}
