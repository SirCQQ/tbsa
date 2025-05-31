import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SafeUser, JWTPayload } from "@/types/auth";
import { prisma } from "@/lib/prisma";
import { PermissionService } from "@/services/permission.service";
import {
  PermissionResource,
  PermissionAction,
  PermissionScope,
} from "@prisma/client/wasm";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
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

      // Get user permissions for client-side checks
      const permissions = await PermissionService.getUserPermissionStrings(
        user.id
      );

      // Prepare safe user data
      const safeUser: SafeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        administrator: user.administrator,
        owner: user.owner,
        ownerId: user.owner?.id || null,
        permissions,
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
   * Require specific permission for a page (redirects if not authorized)
   */
  static async requirePermission(
    resource: PermissionResource,
    action: PermissionAction,
    scope?: PermissionScope,
    redirectTo: string = "/unauthorized"
  ): Promise<SafeUser> {
    const user = await AuthServerService.requireAuth();

    const hasPermission = await PermissionService.hasPermission(user.id, {
      resource,
      action,
      scope,
    });

    if (!hasPermission) {
      redirect(redirectTo);
    }

    return user;
  }

  /**
   * Check if user has specific permission (returns boolean, no redirect)
   */
  static async hasPermission(
    resource: PermissionResource,
    action: PermissionAction,
    scope?: PermissionScope
  ): Promise<boolean> {
    const { user, isAuthenticated } = await AuthServerService.getCurrentUser();

    if (!isAuthenticated || !user) {
      return false;
    }

    return await PermissionService.hasPermission(user.id, {
      resource,
      action,
      scope,
    });
  }

  /**
   * Require any of the specified permissions (redirects if none are met)
   */
  static async requireAnyPermission(
    permissions: Array<{
      resource: PermissionResource;
      action: PermissionAction;
      scope?: PermissionScope;
    }>,
    redirectTo: string = "/unauthorized"
  ): Promise<SafeUser> {
    const user = await AuthServerService.requireAuth();

    const hasAnyPermission = await PermissionService.hasAnyPermission(
      user.id,
      permissions
    );

    if (!hasAnyPermission) {
      redirect(redirectTo);
    }

    return user;
  }

  /**
   * Check if user has any of the specified permissions (returns boolean, no redirect)
   */
  static async hasAnyPermission(
    permissions: Array<{
      resource: PermissionResource;
      action: PermissionAction;
      scope?: PermissionScope;
    }>
  ): Promise<boolean> {
    const { user, isAuthenticated } = await AuthServerService.getCurrentUser();

    if (!isAuthenticated || !user) {
      return false;
    }

    return await PermissionService.hasAnyPermission(user.id, permissions);
  }

  /**
   * Get user context from JWT payload (for API routes)
   */
  static getUserFromHeaders(headers: Headers): JWTPayload | null {
    const userId = headers.get("x-user-id");
    const userEmail = headers.get("x-user-email");
    const userPermissions = headers.get("x-user-permissions");
    const administratorId = headers.get("x-administrator-id");
    const ownerId = headers.get("x-owner-id");

    if (!userId || !userEmail) {
      return null;
    }

    return {
      userId,
      email: userEmail,
      permissions: userPermissions ? JSON.parse(userPermissions) : [],
      administratorId: administratorId || undefined,
      ownerId: ownerId || undefined,
    };
  }

  /**
   * Validate tenant access for API routes using permissions
   */
  static async validateTenantAccess(
    userContext: JWTPayload,
    resourceAdministratorId?: string
  ): Promise<boolean> {
    // Check if user has admin permissions for all resources
    const hasAdminAccess = await PermissionService.hasPermission(
      userContext.userId,
      {
        resource: "buildings",
        action: "read",
        scope: "all",
      }
    );

    if (hasAdminAccess) {
      return true;
    }

    // Check if user has building-specific access
    if (
      resourceAdministratorId &&
      userContext.administratorId === resourceAdministratorId
    ) {
      return true;
    }

    // Check if user has owner permissions for their buildings
    if (userContext.ownerId) {
      const hasOwnerAccess = await PermissionService.hasPermission(
        userContext.userId,
        {
          resource: "buildings",
          action: "read",
          scope: "building",
        }
      );
      return hasOwnerAccess;
    }

    return false;
  }

  /**
   * Higher-order function for protecting API routes with permission checks
   */
  static withPermission(
    handler: (
      request: Request,
      context: { user: JWTPayload }
    ) => Promise<Response>,
    resource: PermissionResource,
    action: PermissionAction,
    scope?: PermissionScope
  ) {
    return async (request: Request): Promise<Response> => {
      const userContext = AuthServerService.getUserFromHeaders(request.headers);

      if (!userContext) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      const hasPermission = await PermissionService.hasPermission(
        userContext.userId,
        {
          resource,
          action,
          scope,
        }
      );

      if (!hasPermission) {
        return new Response(
          JSON.stringify({ error: "Insufficient permissions" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      return handler(request, { user: userContext });
    };
  }

  /**
   * Higher-order function for protecting API routes with authentication only
   */
  static withAuth(
    handler: (
      request: Request,
      context: { user: JWTPayload }
    ) => Promise<Response>
  ) {
    return async (request: Request): Promise<Response> => {
      const userContext = AuthServerService.getUserFromHeaders(request.headers);

      if (!userContext) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      return handler(request, { user: userContext });
    };
  }
}

// Export convenience functions
export const getCurrentUser = AuthServerService.getCurrentUser;
export const requireAuth = AuthServerService.requireAuth;
export const requirePermission = AuthServerService.requirePermission;
export const hasPermission = AuthServerService.hasPermission;
export const requireAnyPermission = AuthServerService.requireAnyPermission;
export const hasAnyPermission = AuthServerService.hasAnyPermission;
export const getUserFromHeaders = AuthServerService.getUserFromHeaders;
export const validateTenantAccess = AuthServerService.validateTenantAccess;
export const withAuth = AuthServerService.withAuth;
export const withPermission = AuthServerService.withPermission;
