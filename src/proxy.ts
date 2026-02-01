import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. If no token and trying to access ANY superviseur page, go to login
  if (pathname.startsWith("/superviseur") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If token exists and trying to access login, go to superviseur
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/superviseur", request.url));
  }

  // 3. ALLOW all other sub-paths (like /superviseur/sales) to pass through
  return NextResponse.next();
}

export const config = {
  matcher: ["/superviseur/:path*", "/login"],
};
