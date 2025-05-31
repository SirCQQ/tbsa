import { NextRequest, NextResponse } from "next/server";
import { createAuthError, auditAuthEvent } from "@/lib/auth-errors";
import { AuthErrorKey } from "@/types/api";
import { SessionService } from "@/services/session.service";
import { PermissionService } from "@/services/permission.service";
import { SessionFingerprint } from "@/types/auth";
import { PermissionString, parsePermissionString } from "@/lib/constants";
import { jwtVerify } from "jose";

// JWT secret for verification (same as in SessionService)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const accessSecret = new TextEncoder().encode(JWT_SECRET);

// Define protected routes and their required permissions
const protectedRoutes = {
  "/api/buildings": [
    "buildings:read:all",
    "buildings:create:all",
  ] as PermissionString[],
  "/api/apartments": [
    "apartments:read:all",
    "apartments:read:own",
  ] as PermissionString[],
  "/api/invite-codes": [
    "invite_codes:read:all",
    "invite_codes:create:all",
  ] as PermissionString[],
  "/dashboard": [
    "buildings:read:all",
    "apartments:read:own",
  ] as PermissionString[], // Any user with basic permissions
  "/dashboard/admin": [
    "buildings:read:all",
    "roles:read:all",
  ] as PermissionString[], // Admin-specific permissions
  "/admin": ["admin_grant:create:all"] as PermissionString[], // Super admin permissions
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
  // Note: /dashboard is NOT in public routes - it's protected
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

/**
 * Check if user has any of the required permissions for a route using hierarchical logic
 */
function hasRequiredPermissions(
  userPermissions: string[],
  requiredPermissions: PermissionString[]
): boolean {
  return requiredPermissions.some((permission) => {
    // Parse the permission string to PermissionCheck object
    const parsed = parsePermissionString(permission);
    const permissionCheck = {
      resource: parsed.resource,
      action: parsed.action,
      scope: parsed.scope || undefined, // Convert null to undefined
    };

    console.log({ permissionCheck });
    // Use hierarchical permission checking
    return PermissionService.hasPermissionFromString(
      userPermissions,
      permissionCheck
    );
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔍 Middleware executing for: ${pathname}`);

  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";

  // Allow public routes
  if (
    publicRoutes.some((route) => {
      // Special case for root route - exact match only
      if (route === "/") {
        return pathname === "/";
      }
      // For other routes, use startsWith
      return pathname.startsWith(route);
    })
  ) {
    console.log(`✅ Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Check if this is a protected route
  const protectedRouteEntry = Object.entries(protectedRoutes).find(([route]) =>
    pathname.startsWith(route)
  );

  // If it's not a protected route, allow it to pass through
  // This allows 404 pages and other unprotected routes to work
  if (!protectedRouteEntry) {
    console.log(`🔓 Unprotected route allowed: ${pathname}`);
    return NextResponse.next();
  }

  const [protectedRoute, requiredPermissions] = protectedRouteEntry;
  console.log(
    `🔒 Protected route detected: ${pathname} -> ${protectedRoute}, requires: ${requiredPermissions.join(
      ", "
    )}`
  );

  // Get auth token from cookies
  const authToken = request.cookies.get("auth-token")?.value;

  if (!authToken) {
    console.log(`❌ No auth token found for: ${pathname}`);
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

  console.log(`🔑 Auth token found, verifying...`);

  try {
    // Simplified JWT verification for Edge Runtime (no Prisma)
    let payload: CustomJWTPayload;

    try {
      // Verify JWT token only (no session validation in middleware)
      const { payload: jwtPayload } = await jwtVerify(authToken, accessSecret);
      payload = jwtPayload as unknown as CustomJWTPayload;
      console.log(`✅ JWT token verified for user: ${payload.email}`);
    } catch (jwtError) {
      console.log(`❌ JWT verification failed: ${jwtError}`);
      // JWT verification failed, redirect to login
      if (pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
          error: "Token verification failed",
        },
        { status: 401 }
      );
    }

    const userId = payload.userId as string;
    const email = payload.email as string;
    const permissions = payload.permissions as string[];
    const administratorId = payload.administratorId as string | undefined;
    const ownerId = payload.ownerId as string | undefined;

    console.log(`🔍 User permissions: ${permissions.join(", ")}`);
    console.log(`🔍 Required permissions: ${requiredPermissions.join(", ")}`);

    // Check if user has required permissions for this route
    if (!hasRequiredPermissions(permissions, requiredPermissions)) {
      console.log("here");
      console.log(`❌ Insufficient permissions for user: ${email}`);
      // User doesn't have required permissions
      if (pathname.startsWith("/dashboard")) {
        // For dashboard routes, redirect to appropriate dashboard based on permissions
        if (permissions.some((p) => p.includes("apartments:read:own"))) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } else {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }
      console.log("here");
      // For API routes, return permission denied error
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient permissions",
          error: "Permission denied",
        },
        { status: 403 }
      );
    }

    console.log(`✅ Access granted for user: ${email} to ${pathname}`);

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
