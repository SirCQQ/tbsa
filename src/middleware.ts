import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

// Define protected routes and their required roles
const protectedRoutes = {
  "/api/buildings": ["ADMINISTRATOR"],
  "/api/apartments": ["ADMINISTRATOR", "OWNER"],
  "/api/water-readings": ["ADMINISTRATOR", "OWNER"],
  "/dashboard": ["ADMINISTRATOR", "OWNER"],
  "/admin": ["ADMINISTRATOR"],
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
      return redirectToLogin(request);
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role as string;

    // Check if user has required role for this route
    const requiredRoles =
      protectedRoutes[protectedRoute as keyof typeof protectedRoutes];

    if (!requiredRoles.includes(userRole as any)) {
      return new NextResponse(
        JSON.stringify({ error: "Insufficient permissions" }),
        {
          status: 403,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", userRole);
    requestHeaders.set("x-user-email", payload.email as string);

    if (payload.administratorId) {
      requestHeaders.set(
        "x-administrator-id",
        payload.administratorId as string
      );
    }

    if (payload.ownerId) {
      requestHeaders.set("x-owner-id", payload.ownerId as string);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware authentication error:", error);

    // Clear invalid cookie and redirect to login
    const response = redirectToLogin(request);
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  }
}

function redirectToLogin(request: NextRequest) {
  // For API routes, return 401
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { "content-type": "application/json" },
      }
    );
  }

  // For pages, redirect to login
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
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
