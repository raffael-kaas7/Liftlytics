import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, authIsConfigured, getExpectedAuthTokens } from "@/lib/auth";

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/icon.svg" ||
    pathname === "/favicon.ico"
  );
}

function isAuthorized(request: NextRequest) {
  if (!authIsConfigured()) {
    return true;
  }

  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return Boolean(sessionToken && getExpectedAuthTokens().includes(sessionToken));
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  if (request.nextUrl.pathname === "/login" && isAuthorized(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicPath(request.nextUrl.pathname) && !isAuthorized(request)) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
