import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirect to login only if accessing protected area without token
  // Use a regex or check for both prefixes
  const isProtectedRoute =
    pathname.startsWith("/superviseur") || pathname.startsWith("/admin");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If token exists and on login, redirect to root "/"
  // Root page.tsx already handles the logic to send users to their specific dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superviseur/:path*", "/admin/:path*", "/login"],
};
