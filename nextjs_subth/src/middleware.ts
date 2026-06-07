import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: Redirect old /member/* URLs to new public routes
 * ยกเว้น /member/profile ที่ยังต้อง login
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /member/profile ยังต้อง login — ไม่ redirect
  if (pathname.startsWith("/member/profile")) {
    return NextResponse.next();
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
  matcher: ["/member/:path*"],
};
