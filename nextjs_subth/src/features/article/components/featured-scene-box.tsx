"use client";

import { Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";

interface FeaturedSceneBoxProps {
  featuredScene: string;
  className?: string;
}

export function FeaturedSceneBox({
  featuredScene,
  className,
}: FeaturedSceneBoxProps) {
  const { t } = useDictionary();

  if (!featuredScene) return null;

  return (
    <div
      className={cn(
        "my-6 p-5 bg-muted/30 border-l-4 border-primary rounded-r-lg",
        className
      )}
    >
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Film className="h-5 w-5 text-primary" />
        {t("article.featuredScene")}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{featuredScene}</p>
    </div>
  );
}
