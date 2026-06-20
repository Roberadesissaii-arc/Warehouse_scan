import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/sign-in"];
const SESSION_COOKIE = "session";

function hasSession(req: NextRequest) {
  return Boolean(req.cookies.get(SESSION_COOKIE)?.value);
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const signedIn = hasSession(req);
  const isPublic = isPublicPath(pathname);

  if (pathname === "/") {
    return NextResponse.redirect(new URL(signedIn ? "/home" : "/sign-in", req.url));
  }

  if (!signedIn && !isPublic) {
    const url = new URL("/sign-in", req.url);
    if (pathname !== "/home") {
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url);
  }

  // Do not redirect away from /sign-in just because a session cookie exists.
  // Stale cookies are cleared after failed login; AuthProvider sends real sessions to /home.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest).*)"],
};
