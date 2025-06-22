import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    console.log("\n\n\n\n\n\mmiddleware\n\n\n\n\n\n\n", { token });
    // Debug logging (remove in production)
    console.log("🚦 Middleware running for:", pathname);
    console.log("🔐 Token exists:", !!token);

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
        console.log("✅ Allowing unauthenticated access to:", pathname);
        return NextResponse.next();
      }

      // Redirect authenticated users away from auth pages (except specific ones)
      if (
        token &&
        !pathname.includes("/signout") &&
        !pathname.includes("/verify")
      ) {
        console.log("🔄 Redirecting authenticated user to dashboard");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        console.log("🚫 No token for dashboard, redirecting to login");
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Allow access to dashboard if authenticated
      console.log("✅ Authenticated user accessing dashboard");
      return NextResponse.next();
    }

    // Organization-specific routes protection
    if (pathname.startsWith("/org/")) {
      if (!token) {
        console.log("🚫 No token for org route:", pathname);
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Extract organization slug from URL
      const orgSlug = pathname.split("/")[2];
      const userOrganizations = token.organizations || [];

      console.log("🏢 Checking org access for:", orgSlug);
      console.log(
        "📋 User orgs:",
        userOrganizations.map((org) => org.code)
      );

      // Check if user has access to this organization
      const hasAccess = userOrganizations.some(
        (org) => org.code.toLowerCase() === orgSlug.toLowerCase()
      );

      if (!hasAccess) {
        console.log("🚫 Access denied to org:", orgSlug);
        return NextResponse.redirect(
          new URL("/dashboard?error=no-access", req.url)
        );
      }

      console.log("✅ Org access granted");
      return NextResponse.next();
    }

    // Allow all other routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("\n\n\n\n\n\ncallbacks\n\n\n\n\n\n\n", { token });
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
