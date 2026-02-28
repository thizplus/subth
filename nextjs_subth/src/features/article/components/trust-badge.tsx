"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useDictionary } from "@/components/dictionary-provider";

interface TrustBadgeProps {
  updatedAt: string;
}

export function TrustBadge({ updatedAt }: TrustBadgeProps) {
  const { t, locale, getLocalizedPath } = useDictionary();
  const authorPath = getLocalizedPath("/author/subth-editorial");
  const dateLocale = locale === "en" ? "en-US" : "th-TH";

  const formattedDate = new Date(updatedAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-success/20 bg-success/5 px-3 py-1.5 text-xs">
      <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
      <span className="text-muted-foreground">
        {t("article.verifiedBy")}{" "}
        <Link
          href={authorPath}
          className="font-medium text-success hover:underline"
        >
          SubTH Editorial
        </Link>
        {" · "}
        {formattedDate}
        <span className="text-success/50"> • </span>
        <span className="text-success">{t("article.malwareFree")}</span>
      </span>
    </div>
  );
}
