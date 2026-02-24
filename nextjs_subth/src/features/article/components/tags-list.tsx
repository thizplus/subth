import Link from "next/link";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TagDescription } from "../types";

interface TagsListProps {
  tags?: TagDescription[];
}

export function TagsList({ tags }: TagsListProps) {
  if (!tags?.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Tag className="h-4 w-4" />
        แท็ก
      </h3>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag.id} href={tag.url}>
            <Badge
              variant="secondary"
              className="cursor-pointer transition-colors hover:bg-secondary/80"
            >
              {tag.name}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}
