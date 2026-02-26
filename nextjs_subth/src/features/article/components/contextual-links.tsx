import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowUpRight } from "lucide-react";
import type { ContextualLink } from "../types";
import { StarRating } from "./star-rating";

interface ContextualLinksProps {
  links?: ContextualLink[];
}

export function ContextualLinks({ links }: ContextualLinksProps) {
  if (!links?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Sparkles className="h-5 w-5 text-primary" />
        คุณอาจสนใจ
      </h2>

      <div className="space-y-3">
        {links.map((link, index) => (
          <Link
            key={index}
            href={`/articles/${link.linkedSlug}`}
            className="group flex gap-4 rounded-xl border bg-gradient-to-br from-muted/30 to-transparent p-3 transition-all hover:border-primary/30 hover:shadow-md"
          >
            {link.thumbnailUrl && (
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={link.thumbnailUrl}
                  alt={link.linkedTitle}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="128px"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col justify-between py-0.5">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {link.text}
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="font-medium text-sm line-clamp-1 group-hover:text-primary">
                    {link.linkedTitle}
                  </p>
                  {link.qualityScore && (
                    <StarRating
                      score={link.qualityScore}
                      showScore={false}
                      size="sm"
                      className="shrink-0"
                    />
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
