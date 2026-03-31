import { auth } from "@/config/auth";
import { NextResponse } from "next/server";

/**
 * Role-based route protection in middleware
 * Provides quick role checks for known protected routes.
 */

// Manage routes - requires ADMIN role
const MANAGE_ROUTES = ["/manage"];

// Routes that require authentication (any role)
const PROTECTED_ROUTES = ["/dashboard", "/settings"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isManageRoute = MANAGE_ROUTES.some((route) => pathname.startsWith(route));

  // Auth pages (redirect authenticated users away)
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email");

  // Redirect unauthenticated users trying to access protected routes
  if ((isProtectedRoute || isManageRoute) && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Check manage routes - requires ADMIN role
  if (isManageRoute && isLoggedIn) {
    const userRoleName = req.auth?.user?.role?.name;

    if (!userRoleName || userRoleName !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
