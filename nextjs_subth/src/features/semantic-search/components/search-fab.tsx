"use client";

import { Bot } from "lucide-react";
import Link from "next/link";
import { useDictionary } from "@/components/dictionary-provider";

export function SearchFab() {
  const { t, getLocalizedPath } = useDictionary();

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-center gap-2">
      <Link
        href={getLocalizedPath("/ai-search")}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 fab-glow"
        aria-label={t("search.ai")}
      >
        <Bot className="h-8 w-8" />
        {/* Animated ring effect */}
        <span className="absolute inset-0 rounded-full bg-primary/30 fab-ring" />
      </Link>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {t("search.aiDescription")}
      </span>
    </div>
  );
}
