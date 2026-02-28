"use client";

import { Play, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";
import { LoginDialog, useAuthStore } from "@/features/auth";

interface HardCTAProps {
  videoId: string;
  className?: string;
}

export function HardCTA({ videoId, className }: HardCTAProps) {
  const { t, locale } = useDictionary();
  const { isAuthenticated } = useAuthStore();

  const handleScrollToVideo = () => {
    const videoSection = document.getElementById("video-player");
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const benefits = [
    t("article.benefitQualitySub"),
    t("article.benefitDailyUpdate"),
    t("article.benefitNoAds"),
  ];

  const buttonContent = (
    <>
      <Play className="h-5 w-5" />
      {t("common.watchVideo")}
    </>
  );

  const buttonClassName =
    "inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors cursor-pointer";

  return (
    <div
      className={cn(
        "my-8 p-6 rounded-2xl bg-card border shadow-sm",
        className
      )}
    >
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">
          {t("common.allVideos")}
        </h3>

        <div className="flex flex-wrap justify-center gap-3">
          {benefits.map((benefit, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              {benefit}
            </span>
          ))}
        </div>

        {isAuthenticated ? (
          <button onClick={handleScrollToVideo} className={buttonClassName}>
            {buttonContent}
          </button>
        ) : (
          <LoginDialog locale={locale as "th" | "en"}>
            <button className={buttonClassName}>{buttonContent}</button>
          </LoginDialog>
        )}
      </div>
    </div>
  );
}
