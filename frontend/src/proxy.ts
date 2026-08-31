import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED = ["/", "/history", "/trips", "/profile"];
// Routes only for guests (redirect to / if already logged in)
const GUEST_ONLY = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const token    = request.cookies.get("kelana_token")?.value;
  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isGuestOnly = GUEST_ONLY.some((p) => pathname === p);

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isGuestOnly && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.webp|.*\\.png).*)"],
};
