import { API_URL, API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type { User } from "./types";

export const authService = {
  // Get Google OAuth URL - redirect ไป backend พร้อม base URL
  getGoogleOAuthURL(): string {
    // ส่งแค่ origin (base URL) เพราะ backend จะต่อ /auth/google/callback เอง
    const baseUrl = typeof window !== "undefined"
      ? window.location.origin
      : "";

    const redirectParam = encodeURIComponent(baseUrl);
    return `${API_URL}${API_ROUTES.AUTH.GOOGLE}?redirect=${redirectParam}`;
  },

  // Get current user info using token from localStorage
  getMe(): Promise<User> {
    return apiClient.get<User>(API_ROUTES.AUTH.ME);
  },
};
