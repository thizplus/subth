"use client";

import { useAuthStore } from "./store";

/**
 * Hook to access auth state and actions
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    setUser,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    setUser,
  };
}

/**
 * Hook that returns true only when user is fully authenticated
 * (not loading and has valid auth)
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated, isLoading } = useAuthStore();
  return !isLoading && isAuthenticated;
}
