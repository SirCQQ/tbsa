import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

// Define protected routes and their required roles
const protectedRoutes = {
  "/api/buildings": ["ADMINISTRATOR"] as const,
  "/api/apartments": ["ADMINISTRATOR", "OWNER"] as const,
  "/api/water-readings": ["ADMINISTRATOR", "OWNER"] as const,
  "/dashboard": ["ADMINISTRATOR", "OWNER"] as const,
  "/admin": ["ADMINISTRATOR"] as const,
} as const;

// Public routes that don't require authentication
const publicRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/",
  "/login",
  "/register",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const protectedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route)
  );

  if (!protectedRoute) {
    return NextResponse.next();
  }

  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role as string;
    const userId = payload.userId as string;
    const email = payload.email as string;
    const administratorId = payload.administratorId as string | undefined;
    const ownerId = payload.ownerId as string | undefined;

    // Check if user has required role for this route
    const requiredRoles =
      protectedRoutes[protectedRoute as keyof typeof protectedRoutes];
    if (!requiredRoles.some((role) => role === userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Additional tenant validation for specific routes
    if (pathname.startsWith("/api/buildings")) {
      // Only administrators can access buildings
      if (userRole !== "ADMINISTRATOR" || !administratorId) {
        return NextResponse.json(
          { error: "Only administrators can access buildings" },
          { status: 403 }
        );
      }
    }

    // Create response with tenant context headers
    const response = NextResponse.next();

    // Add tenant context headers for API routes to use
    response.headers.set("x-user-id", userId);
    response.headers.set("x-user-role", userRole);
    response.headers.set("x-user-email", email);

    if (administratorId) {
      response.headers.set("x-administrator-id", administratorId);
    }

    if (ownerId) {
      response.headers.set("x-owner-id", ownerId);
    }

    return response;
  } catch (error) {
    console.error("Middleware authentication error:", error);

    // Clear invalid token
    const response = NextResponse.json(
      { error: "Invalid authentication token" },
      { status: 401 }
    );

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
