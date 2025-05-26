import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import type { SafeUser, JWTPayload } from "@/types/auth";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

export type AuthResult = {
  user: SafeUser | null;
  isAuthenticated: boolean;
  error?: string;
};

/**
 * Server-side authentication service
 */
export class AuthServerService {
  /**
   * Get current user from server-side (for Server Components)
   */
  static async getCurrentUser(): Promise<AuthResult> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;

      if (!token) {
        return { user: null, isAuthenticated: false };
      }

      // Verify JWT token
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.userId as string;

      // Fetch fresh user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          administrator: true,
          owner: {
            include: {
              apartments: {
                include: {
                  building: {
                    select: {
                      id: true,
                      name: true,
                      readingDeadline: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return { user: null, isAuthenticated: false, error: "User not found" };
      }

      // Prepare safe user data
      const safeUser: SafeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        administrator: user.administrator,
        owner: user.owner,
      };

      return { user: safeUser, isAuthenticated: true };
    } catch (error) {
      console.error("Server-side auth error:", error);
      return {
        user: null,
        isAuthenticated: false,
        error: "Authentication failed",
      };
    }
  }

  /**
   * Require authentication for a page (redirects if not authenticated)
   */
  static async requireAuth(redirectTo: string = "/login"): Promise<SafeUser> {
    const { user, isAuthenticated } = await AuthServerService.getCurrentUser();

    if (!isAuthenticated || !user) {
      redirect(redirectTo);
    }

    return user;
  }

  /**
   * Require specific role for a page (redirects if not authorized)
   */
  static async requireRole(
    role: "ADMINISTRATOR" | "OWNER",
    redirectTo: string = "/login"
  ): Promise<SafeUser> {
    const user = await AuthServerService.requireAuth(redirectTo);

    if (user.role !== role) {
      redirect("/unauthorized");
    }

    return user;
  }

  /**
   * Check if user has specific role (returns boolean, no redirect)
   */
  static async hasRole(role: "ADMINISTRATOR" | "OWNER"): Promise<boolean> {
    const { user, isAuthenticated } = await AuthServerService.getCurrentUser();
    return isAuthenticated && user?.role === role;
  }

  /**
   * Get user context from JWT payload (for API routes)
   */
  static getUserFromHeaders(headers: Headers): JWTPayload | null {
    const userId = headers.get("x-user-id");
    const userRole = headers.get("x-user-role");
    const userEmail = headers.get("x-user-email");
    const administratorId = headers.get("x-administrator-id");
    const ownerId = headers.get("x-owner-id");

    if (!userId || !userRole || !userEmail) {
      return null;
    }

    return {
      userId,
      role: userRole as "ADMINISTRATOR" | "OWNER",
      email: userEmail,
      administratorId: administratorId || undefined,
      ownerId: ownerId || undefined,
    };
  }

  /**
   * Validate tenant access for API routes
   */
  static validateTenantAccess(
    userContext: JWTPayload,
    resourceAdministratorId?: string
  ): boolean {
    // Administrators can only access their own tenant's resources
    if (userContext.role === "ADMINISTRATOR") {
      return userContext.administratorId === resourceAdministratorId;
    }

    // Owners can access resources in their buildings
    if (userContext.role === "OWNER") {
      // This would need additional logic to check if the owner
      // has access to the specific resource based on their apartments
      return true; // Simplified for now
    }

    return false;
  }

  /**
   * Higher-order function for protecting API routes
   */
  static withAuth(
    handler: (
      request: Request,
      context: { user: JWTPayload }
    ) => Promise<Response>,
    requiredRole?: "ADMINISTRATOR" | "OWNER"
  ) {
    return async (request: Request): Promise<Response> => {
      const userContext = AuthServerService.getUserFromHeaders(request.headers);

      if (!userContext) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      if (requiredRole && userContext.role !== requiredRole) {
        return new Response(
          JSON.stringify({ error: "Insufficient permissions" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      return handler(request, { user: userContext });
    };
  }
}

// Export convenience functions for backward compatibility
export const getCurrentUser = AuthServerService.getCurrentUser;
export const requireAuth = AuthServerService.requireAuth;
export const requireRole = AuthServerService.requireRole;
export const hasRole = AuthServerService.hasRole;
export const getUserFromHeaders = AuthServerService.getUserFromHeaders;
export const validateTenantAccess = AuthServerService.validateTenantAccess;
export const withAuth = AuthServerService.withAuth;
