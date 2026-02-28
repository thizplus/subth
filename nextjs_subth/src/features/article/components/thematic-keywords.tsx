"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { useDictionary } from "@/components/dictionary-provider";

interface ThematicKeywordsProps {
  keywords: string[];
  locale?: "th" | "en";
}

export function ThematicKeywords({
  keywords,
  locale: localeProp,
}: ThematicKeywordsProps) {
  const { isAuthenticated } = useAuthStore();
  const { t, locale: contextLocale, getLocalizedPath } = useDictionary();
  const locale = localeProp ?? (contextLocale as "th" | "en");

  if (!keywords || keywords.length === 0) return null;

  // Convert keyword to search-friendly slug
  const toSearchQuery = (keyword: string) => {
    return encodeURIComponent(keyword.toLowerCase().trim());
  };

  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Tag className="h-5 w-5 text-primary" />
        {t("article.relatedTopics")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) =>
          isAuthenticated ? (
            <Link
              key={index}
              href={getLocalizedPath(`/member/search?q=${toSearchQuery(keyword)}`)}
              className="rounded-full border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              {keyword}
            </Link>
          ) : (
            <LoginDialog key={index} locale={locale}>
              <button className="rounded-full border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                {keyword}
              </button>
            </LoginDialog>
          )
        )}
      </div>
    </section>
  );
}
