"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Play } from "lucide-react";
import { useDictionary } from "@/components/dictionary-provider";
import type { ContextualLink } from "../types";
import { StarRating } from "./star-rating";

interface ContextualLinksProps {
  links?: ContextualLink[];
}

export function ContextualLinks({ links }: ContextualLinksProps) {
  const { t, getLocalizedPath } = useDictionary();

  if (!links?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Sparkles className="h-5 w-5 text-primary" />
        {t("article.youMayLike")}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link, index) => (
          <Link
            key={index}
            href={getLocalizedPath(`/articles/review/${link.linkedSlug}`)}
            className="group block overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Thumbnail with overlay */}
            <div className="relative aspect-video overflow-hidden">
              {link.thumbnailUrl ? (
                <Image
                  src={link.thumbnailUrl}
                  alt={link.linkedTitle}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Play indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
                  <Play className="h-5 w-5 fill-current" />
                </div>
              </div>
              {/* Rating badge */}
              {link.rating && (
                <div className="absolute bottom-2 left-2">
                  <StarRating rating={link.rating} showScore={true} size="sm" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              <p className="mb-1 text-xs text-primary font-medium line-clamp-1">
                {link.text}
              </p>
              <h3 className="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {link.linkedTitle}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
