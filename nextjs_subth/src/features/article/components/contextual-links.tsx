"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useDictionary } from "@/components/dictionary-provider";
import type { ContextualLink } from "../types";
import { StarRating } from "./star-rating";

interface ContextualLinksProps {
  links?: ContextualLink[];
}

export function ContextualLinks({ links }: ContextualLinksProps) {
  const { t } = useDictionary();

  if (!links?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Sparkles className="h-5 w-5 text-primary" />
        {t("article.youMayLike")}
      </h2>

      <div className="space-y-3">
        {links.map((link, index) => (
          <Link
            key={index}
            href={`/articles/review/${link.linkedSlug}`}
            className="group flex flex-col sm:flex-row gap-3 sm:gap-4 rounded-xl border bg-gradient-to-br from-muted/30 to-transparent p-3 transition-all hover:border-primary/30 hover:shadow-md"
          >
            {link.thumbnailUrl && (
              <div className="relative aspect-video sm:aspect-auto sm:h-20 sm:w-32 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={link.thumbnailUrl}
                  alt={link.linkedTitle}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 128px"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1.5 sm:gap-1 sm:py-0.5">
              <p className="text-sm text-muted-foreground">
                {link.text}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm line-clamp-1 group-hover:text-primary min-w-0">
                  {link.linkedTitle}
                </p>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </div>
              {link.rating && (
                <StarRating
                  rating={link.rating}
                  showScore={true}
                  size="sm"
                />
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
