import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Skip middleware for API routes and static files
    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.includes(".") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    // Handle auth pages
    if (pathname.startsWith("/auth/")) {
      // Allow access to auth pages when not authenticated
      if (!token) {
        return NextResponse.next();
      }

      // Redirect authenticated users away from auth pages (except specific ones)
      if (
        token &&
        !pathname.includes("/signout") &&
        !pathname.includes("/verify")
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Allow access to dashboard if authenticated

      return NextResponse.next();
    }

    // Organization-specific routes protection
    if (pathname.startsWith("/org/")) {
      if (!token) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Extract organization slug from URL
      const orgSlug = pathname.split("/")[2];
      const userOrganizations = token.organizations || [];

      // Check if user has access to this organization
      const hasAccess = userOrganizations.some(
        (org) => org.code.toLowerCase() === orgSlug.toLowerCase()
      );

      if (!hasAccess) {
        return NextResponse.redirect(
          new URL("/dashboard?error=no-access", req.url)
        );
      }

      return NextResponse.next();
    }

    // Allow all other routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Only run authorization check for protected routes
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/org/") ||
          pathname.startsWith("/admin")
        ) {
          return !!token;
        }

        // Allow all other routes (public, auth pages, etc.)
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Only match the routes we actually want to protect/handle
    "/dashboard/:path*",
    "/auth/:path*",
    "/org/:path*",
    "/admin/:path*",
  ],
};
