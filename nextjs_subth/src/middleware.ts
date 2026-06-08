import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware:
 * 1. Redirect old /member/* and /en/member/* URLs to new public routes
 * 2. Set x-locale header for root layout lang attribute
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Profile + AI Search ยังต้อง login — ไม่ redirect
  if (pathname.includes("/member/profile") || pathname.includes("/member/ai-search")) {
    const response = NextResponse.next();
    response.headers.set("x-locale", pathname.startsWith("/en") ? "en" : "th");
    return response;
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

  // Set locale header for all other requests
  const locale = pathname.startsWith("/en") ? "en" : "th";
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
