"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoginDialog } from "@/features/auth";
import { formatTimestamp, parseDuration } from "../utils";
import type { KeyMoment } from "../types";

interface KeyMomentsPreviewProps {
  keyMoments: KeyMoment[];
  duration: string; // ISO 8601
  videoId: string;
  locale?: "th" | "en";
}

export function KeyMomentsPreview({
  keyMoments,
  duration,
  locale = "th",
}: KeyMomentsPreviewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const totalSeconds = parseDuration(duration);

  if (!keyMoments?.length || totalSeconds === 0) {
    return null;
  }

  const handleMomentClick = () => {
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4 rounded-xl border bg-gradient-to-b from-muted/30 to-transparent p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Play className="h-4 w-4 fill-primary text-primary" />
        {locale === "th" ? "ฉากสำคัญ" : "Key Moments"}
        <span className="text-xs font-normal text-muted-foreground">
          ({keyMoments.length} {locale === "th" ? "ฉาก" : "scenes"})
        </span>
      </p>

      {/* Progress bar with markers */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <TooltipProvider>
          {keyMoments.map((moment, index) => {
            const position = (moment.startOffset / totalSeconds) * 100;
            const width =
              ((moment.endOffset - moment.startOffset) / totalSeconds) * 100;

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    className="absolute top-0 h-2.5 cursor-pointer rounded-full bg-primary shadow-sm transition-all hover:scale-y-125 hover:bg-primary/80"
                    style={{
                      left: `${position}%`,
                      width: `${Math.max(width, 2)}%`,
                      minWidth: "10px",
                    }}
                    onClick={handleMomentClick}
                    aria-label={`ไปยัง ${moment.name}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">{moment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(moment.startOffset)}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Moment list - min-h-11 for 44px touch target */}
      <div className="flex flex-wrap gap-3">
        <TooltipProvider>
          {keyMoments.map((moment, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleMomentClick}
                  className="group inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 min-h-11 text-xs transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <span className="shrink-0 rounded bg-primary/10 px-2 py-1 font-mono text-[11px] font-medium text-primary">
                    {formatTimestamp(moment.startOffset)}
                  </span>
                  <span className="font-medium group-hover:text-primary">
                    {moment.name}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium">{moment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(moment.startOffset)} - {formatTimestamp(moment.endOffset)}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Login Dialog - controlled */}
      <LoginDialog locale={locale} open={dialogOpen} onOpenChange={setDialogOpen}>
        <span className="hidden" />
      </LoginDialog>
    </div>
  );
}
