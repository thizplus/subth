import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";
import type { ContextualLink } from "../types";

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

      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link, index) => (
          <Link
            key={index}
            href={`/articles/${link.linkedSlug}`}
            className="group flex items-start gap-3 rounded-xl border bg-gradient-to-br from-muted/30 to-transparent p-4 transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{link.text}</p>
              <p className="mt-1 font-medium group-hover:text-primary">
                {link.linkedTitle}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  );
}
