import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  createAuthError,
  getJWTErrorType,
  auditAuthEvent,
} from "@/lib/auth-errors";
import { AuthErrorKey } from "@/types/api";
import { SessionService } from "@/services/session.service";
import { SessionFingerprint } from "@/types/auth";
import { UserRole } from "@/types/auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

// Define protected routes and their required roles
const protectedRoutes = {
  "/api/buildings": ["ADMINISTRATOR"] as const,
  "/api/apartments": ["ADMINISTRATOR", "OWNER"] as const,
  "/api/invite-codes": ["ADMINISTRATOR", "OWNER"] as const,
  "/dashboard": ["ADMINISTRATOR", "OWNER"] as const,
  "/dashboard/admin": ["ADMINISTRATOR"] as const,
  "/dashboard/apartments": ["ADMINISTRATOR", "OWNER"] as const,
  "/admin": ["ADMINISTRATOR"] as const,
} as const;

// Public routes that don't require authentication
const publicRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/refresh",
  "/",
  "/login",
  "/register",
];

/**
 * Extract client IP address from request headers
 */
function getClientIP(request: NextRequest): string | undefined {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-client-ip") ||
    undefined
  );
}

interface CustomJWTPayload {
  userId: string;
  email: string;
  permissions: string[];
  administratorId?: string;
  ownerId?: string;
  sessionId?: string;
  fingerprint?: string;
  iat: number;
  exp: number;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`Middleware executing for: ${pathname}`);

  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";

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

  // Get auth token from cookies
  const authToken = request.cookies.get("auth-token")?.value;

  if (!authToken) {
    // For dashboard routes, redirect to login instead of returning JSON error
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // For API routes, return JSON error
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required",
        error: "No token provided",
      },
      { status: 401 }
    );
  }

  try {
    // Create current session fingerprint
    const currentFingerprint: SessionFingerprint = {
      userAgent,
      ipAddress: clientIP || "",
      acceptLanguage: request.headers.get("accept-language") || "",
      acceptEncoding: request.headers.get("accept-encoding") || "",
    };

    let payload: CustomJWTPayload;

    try {
      // Try enhanced verification first
      const enhancedResult = await SessionService.verifyAccessToken(
        authToken,
        currentFingerprint
      );

      if (enhancedResult.success && enhancedResult.data) {
        payload = enhancedResult.data as CustomJWTPayload;
      } else {
        throw new Error("Enhanced verification failed");
      }
    } catch (enhancedError) {
      // Fallback to legacy verification for backward compatibility
      try {
        const { payload: legacyPayload } = await jwtVerify(
          authToken,
          JWT_SECRET
        );
        payload = legacyPayload as unknown as CustomJWTPayload;
      } catch (legacyError) {
        auditAuthEvent(
          "token_invalid",
          undefined,
          undefined,
          clientIP,
          userAgent,
          { reason: "verification_failed", path: pathname }
        );

        // For dashboard routes, redirect to login instead of returning JSON error
        if (pathname.startsWith("/dashboard")) {
          return NextResponse.redirect(new URL("/login", request.url));
        }

        return createAuthError(AuthErrorKey.INVALID_TOKEN);
      }
    }

    const userId = payload.userId as string;
    const email = payload.email as string;
    const permissions = payload.permissions as string[];
    const administratorId = payload.administratorId as string | undefined;
    const ownerId = payload.ownerId as string | undefined;

    // Check if user has required permissions for this route
    // For now, we'll use a simplified check - if user has any admin permissions, allow admin routes
    const hasAdminPermissions = permissions.some(
      (permission) =>
        permission.includes(":all") || permission.startsWith("admin_grant:")
    );

    // Check role-based access for admin routes
    if (pathname.startsWith("/dashboard/admin")) {
      if (!hasAdminPermissions) {
        // Non-admin trying to access admin dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Add user context to headers for API routes
    const response = NextResponse.next();
    response.headers.set("x-user-id", userId);
    response.headers.set("x-user-email", email);
    response.headers.set("x-user-permissions", JSON.stringify(permissions));

    if (administratorId) {
      response.headers.set("x-administrator-id", administratorId);
    }

    if (ownerId) {
      response.headers.set("x-owner-id", ownerId);
    }

    return response;
  } catch (error) {
    auditAuthEvent("token_invalid", undefined, undefined, clientIP, userAgent, {
      reason: "middleware_error",
      error: error instanceof Error ? error.message : String(error),
      path: pathname,
    });

    // For dashboard routes, redirect to login instead of returning JSON error
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
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
