"use client";

import { ActivityLogger } from "./activity-logger";
import { usePathname } from "next/navigation";

interface VideoActivityLoggerProps {
  videoId: string;
}

/**
 * Video Activity Logger
 * Wrapper component สำหรับใช้ใน video page
 */
export function VideoActivityLogger({ videoId }: VideoActivityLoggerProps) {
  const pathname = usePathname();

  return (
    <ActivityLogger
      pageType="video"
      pageId={videoId}
      path={pathname}
    />
  );
}
