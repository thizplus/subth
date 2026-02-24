"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

// Re-export utils for convenience (client-side usage)
export { formatTimestamp, parseDuration, formatDuration } from "./utils";

/**
 * Hook สำหรับจัดการ click บน key moments
 * Redirect ไป login พร้อม timestamp
 */
export function useKeyMomentClick(videoId: string) {
  const router = useRouter();

  const handleClick = useCallback(
    (timestamp: number) => {
      // Redirect to login with return URL containing timestamp
      const redirectUrl = `/member/videos/${videoId}?t=${timestamp}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    },
    [videoId, router]
  );

  return { handleClick };
}

/**
 * Hook สำหรับ redirect ไป login พร้อม return URL
 */
export function useLoginRedirect() {
  const router = useRouter();

  const redirectToLogin = useCallback(
    (returnUrl: string) => {
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    },
    [router]
  );

  return { redirectToLogin };
}
