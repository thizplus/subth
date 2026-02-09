"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../store";
import { authService } from "../service";
import { userStatsService } from "@/features/user-stats";

interface AuthProviderProps {
  children: ReactNode;
}

const DAILY_VISIT_KEY = "subth_daily_visit";

/**
 * AuthProvider verifies the stored token on mount
 * If token is invalid, clears auth state
 * Also records daily visit for XP
 * Wrap this at the root layout level
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { token, login, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token by fetching user info (token อ่านจาก localStorage ใน service)
        const user = await authService.getMe();
        login(token, user);

        // Record daily visit (once per day)
        recordDailyVisit();
      } catch {
        // Token invalid, clear auth state
        logout();
      }
    };

    verifyToken();
  }, []); // Only run on mount

  return <>{children}</>;
}

/**
 * Record daily visit for XP (max once per day)
 */
function recordDailyVisit() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem(DAILY_VISIT_KEY);

  // Already visited today
  if (lastVisit === today) {
    return;
  }

  // Record visit
  userStatsService.recordLogin()
    .then(() => {
      localStorage.setItem(DAILY_VISIT_KEY, today);
    })
    .catch((err) => {
      console.error("Failed to record daily visit:", err);
    });
}
