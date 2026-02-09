import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /th/... to /...
  if (pathname.startsWith("/th/") || pathname === "/th") {
    const newPathname = pathname.replace("/th", "") || "/";
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  return;
}

export const config = {
  matcher: ["/th", "/th/:path*"],
};
