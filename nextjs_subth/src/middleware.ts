import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: Redirect old /member/* and /en/member/* URLs to new public routes
 * ยกเว้น /member/profile และ /en/member/profile ที่ยังต้อง login
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Profile + AI Search ยังต้อง login — ไม่ redirect
  if (pathname.includes("/member/profile") || pathname.includes("/member/ai-search")) {
    return NextResponse.next();
  }

  // Redirect /en/member/* → /en/*
  if (pathname.startsWith("/en/member")) {
    const newPath = pathname.replace("/en/member", "/en") || "/en";
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url, 301);
  }

  // Redirect /member/* → /*
  if (pathname.startsWith("/member")) {
    const newPath = pathname.replace("/member", "") || "/";
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*", "/en/member/:path*"],
};
