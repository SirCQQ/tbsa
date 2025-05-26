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

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

// Define protected routes and their required roles
const protectedRoutes = {
  "/api/buildings": ["ADMINISTRATOR"] as const,
  "/api/apartments": ["ADMINISTRATOR", "OWNER"] as const,
  "/dashboard": ["ADMINISTRATOR", "OWNER"] as const,
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
  role: "OWNER" | "ADMINISTRATOR";
  iat: number;
  exp: number;
}

async function verifyToken(token: string): Promise<CustomJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as CustomJWTPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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

  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      auditAuthEvent(
        "token_invalid",
        undefined,
        undefined,
        clientIP,
        userAgent,
        { reason: "missing_token", path: pathname }
      );
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Create current session fingerprint
    const currentFingerprint: SessionFingerprint = {
      userAgent,
      ipAddress: clientIP || "",
      acceptLanguage: request.headers.get("accept-language") || "",
      acceptEncoding: request.headers.get("accept-encoding") || "",
    };

    // Try enhanced verification first
    const enhancedResult = await SessionService.verifyAccessToken(
      token,
      currentFingerprint
    );

    let payload;
    if (enhancedResult.success && enhancedResult.data) {
      // Enhanced verification successful
      payload = enhancedResult.data;
    } else {
      // Fallback to legacy verification for backward compatibility
      try {
        const { payload: legacyPayload } = await jwtVerify(token, JWT_SECRET);
        payload = legacyPayload;
      } catch (legacyError) {
        auditAuthEvent(
          "token_invalid",
          undefined,
          undefined,
          clientIP,
          userAgent,
          {
            reason: "token_verification_failed",
            path: pathname,
            enhancedError: enhancedResult.error,
            legacyError:
              legacyError instanceof Error
                ? legacyError.message
                : String(legacyError),
          }
        );
        const errorType = getJWTErrorType(legacyError);
        return createAuthError(errorType);
      }
    }

    const userRole = payload.role as string;
    const userId = payload.userId as string;
    const email = payload.email as string;
    const administratorId = payload.administratorId as string | undefined;
    const ownerId = payload.ownerId as string | undefined;

    // Check if user has required role for this route
    const requiredRoles =
      protectedRoutes[protectedRoute as keyof typeof protectedRoutes];
    if (!requiredRoles.some((role) => role === userRole)) {
      auditAuthEvent("permission_denied", userId, email, clientIP, userAgent, {
        reason: "insufficient_role",
        userRole,
        requiredRoles,
        path: pathname,
      });
      return createAuthError(AuthErrorKey.INSUFFICIENT_PERMISSIONS);
    }

    // Additional tenant validation for specific routes
    if (pathname.startsWith("/api/buildings")) {
      // Only administrators can access buildings
      if (userRole !== "ADMINISTRATOR" || !administratorId) {
        auditAuthEvent(
          "permission_denied",
          userId,
          email,
          clientIP,
          userAgent,
          {
            reason: "tenant_access_denied",
            userRole,
            administratorId,
            path: pathname,
          }
        );
        return createAuthError(
          AuthErrorKey.TENANT_ACCESS_DENIED,
          "Only administrators can access buildings"
        );
      }
    }

    // Check role-based access for admin routes
    if (pathname.startsWith("/dashboard/admin")) {
      if (userRole !== "ADMINISTRATOR") {
        // Non-admin trying to access admin dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Add user context to headers for API routes
    const response = NextResponse.next();
    response.headers.set("x-user-id", userId);
    response.headers.set("x-user-email", email);
    response.headers.set("x-user-role", userRole);

    if (administratorId) {
      response.headers.set("x-administrator-id", administratorId);
    }

    if (ownerId) {
      response.headers.set("x-owner-id", ownerId);
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    auditAuthEvent("token_invalid", undefined, undefined, clientIP, userAgent, {
      reason: "middleware_error",
      error: error instanceof Error ? error.message : String(error),
      path: pathname,
    });
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
