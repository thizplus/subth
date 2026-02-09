"use client";

import { useEffect, useRef } from "react";
import { useLogActivity } from "../hooks";
import type { PageType } from "../types";
import { useAuthStore } from "@/features/auth/store";

interface ActivityLoggerProps {
  pageType: PageType;
  pageId?: string;
  path: string;
  metadata?: Record<string, unknown>;
}

/**
 * ActivityLogger Component
 *
 * Client component ที่เรียก API เพื่อบันทึก activity เมื่อ mount
 * Fire & Forget - ไม่รอ response
 *
 * @example
 * ```tsx
 * // ในหน้า video
 * <ActivityLogger pageType="video" pageId={video.id} path={pathname} />
 *
 * // ในหน้า search
 * <ActivityLogger pageType="search" path={pathname} metadata={{ query: searchQuery }} />
 * ```
 */
export function ActivityLogger({ pageType, pageId, path, metadata }: ActivityLoggerProps) {
  const { token } = useAuthStore();
  const { mutate: logActivity } = useLogActivity();
  const hasLogged = useRef(false);

  useEffect(() => {
    // Skip if not logged in
    if (!token) return;

    // Prevent double logging (React Strict Mode)
    if (hasLogged.current) return;
    hasLogged.current = true;

    // Log activity (Fire & Forget)
    logActivity({
      pageType,
      pageId,
      path,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
  }, [token, pageType, pageId, path, metadata, logActivity]);

  // ไม่ render อะไร
  return null;
}
