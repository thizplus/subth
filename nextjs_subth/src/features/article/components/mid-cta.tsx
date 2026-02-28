"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";

interface MidCTAProps {
  videoId: string;
  className?: string;
}

export function MidCTA({ videoId, className }: MidCTAProps) {
  const { t, getLocalizedPath } = useDictionary();

  return (
    <div
      className={cn(
        "my-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-lg font-medium">
            {t("common.loginToWatch")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("common.videoTypes")}
          </p>
        </div>
        <Link
          href={getLocalizedPath(`/member/videos/${videoId}`)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          <Play className="h-4 w-4" />
          {t("common.watchVideo")}
        </Link>
      </div>
    </div>
  );
}
