"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { authService } from "@/features/auth/service";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.login);
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("error");
      setTimeout(() => router.push(`/login?error=${encodeURIComponent(errorParam)}`), 2000);
      return;
    }

    if (token) {
      // Save token first (for API calls) - เหมือน vite_subth
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: { token, isAuthenticated: true, user: null },
        })
      );

      // Fetch user info
      authService
        .getMe()
        .then((user) => {
          setAuth(token, user);
          router.push("/member");
        })
        .catch((err) => {
          console.error("Failed to get user info:", err);
          localStorage.removeItem("auth-storage");
          setStatus("error");
          setTimeout(() => router.push("/login?error=verification_failed"), 2000);
        });
    } else {
      setStatus("error");
      setTimeout(() => router.push("/login?error=no_token"), 2000);
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      {status === "loading" ? (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">กำลังเข้าสู่ระบบ...</p>
        </>
      ) : (
        <p className="text-destructive">เกิดข้อผิดพลาด กำลังกลับไปหน้า Login...</p>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">กำลังเข้าสู่ระบบ...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
