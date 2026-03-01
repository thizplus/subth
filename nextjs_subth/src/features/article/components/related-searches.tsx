"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";
import type { CastProfile, MakerInfo, TagDescription } from "../types";

interface RelatedSearchesProps {
  searchIntents?: string[];
  tags?: TagDescription[];
  casts?: CastProfile[];
  maker?: MakerInfo;
  className?: string;
}

export function RelatedSearches({
  searchIntents,
  tags,
  casts,
  maker,
  className,
}: RelatedSearchesProps) {
  const { t, getLocalizedPath } = useDictionary();

  const hasContent =
    (searchIntents && searchIntents.length > 0) ||
    (tags && tags.length > 0) ||
    (casts && casts.length > 0) ||
    maker;

  if (!hasContent) return null;

  return (
    <section className={cn("my-8", className)}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        {t("article.searchIntents")}
      </h3>

      <div className="space-y-5">
        {/* Search Intents - text only */}
        {searchIntents && searchIntents.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {t("article.relatedKeywords")}
            </p>
            <div className="flex flex-wrap gap-2">
              {searchIntents.map((intent, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-sm bg-muted rounded-full text-muted-foreground"
                >
                  {intent}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags - linked */}
        {tags && tags.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {t("article.tags")}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={getLocalizedPath(tag.url)}
                  className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Casts - linked */}
        {casts && casts.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {t("article.casts")}
            </p>
            <div className="flex flex-wrap gap-2">
              {casts.map((cast) => (
                <Link
                  key={cast.id}
                  href={getLocalizedPath(cast.profileUrl)}
                  className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                >
                  {cast.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Maker - linked */}
        {maker && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {t("article.studio")}
            </p>
            <Link
              href={getLocalizedPath(maker.profileUrl)}
              className="inline-flex px-3 py-1.5 text-sm border rounded-full hover:bg-muted transition-colors"
            >
              {maker.name}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
