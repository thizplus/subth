"use client";

import { ActivityLogger } from "./activity-logger";
import { usePathname } from "next/navigation";
import type { PageType } from "../types";

interface PageActivityLoggerProps {
  pageType: PageType;
  pageId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Page Activity Logger
 * Generic wrapper component สำหรับใช้ใน server component pages
 */
export function PageActivityLogger({ pageType, pageId, metadata }: PageActivityLoggerProps) {
  const pathname = usePathname();

  return (
    <ActivityLogger
      pageType={pageType}
      pageId={pageId}
      path={pathname}
      metadata={metadata}
    />
  );
}
