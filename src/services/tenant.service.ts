import { NextRequest } from "next/server";
import { PermissionString } from "@/lib/constants";

export type TenantContext = {
  userId: string;
  permissions: PermissionString[];
  administratorId?: string;
  ownerId?: string;
  email: string;
};

/**
 * Multi-tenant service for access control and data isolation
 */
export class TenantService {
  /**
   * Extract tenant context from request headers (set by middleware)
   */
  static getTenantContext(request: NextRequest): TenantContext | null {
    const userId = request.headers.get("x-user-id");
    const permissionsHeader = request.headers.get("x-user-permissions");
    const administratorId = request.headers.get("x-administrator-id");
    const ownerId = request.headers.get("x-owner-id");
    const email = request.headers.get("x-user-email");

    if (!userId || !permissionsHeader || !email) {
      return null;
    }

    let permissions: PermissionString[];
    try {
      permissions = JSON.parse(permissionsHeader) as PermissionString[];
    } catch {
      return null;
    }

    return {
      userId,
      permissions,
      administratorId: administratorId || undefined,
      ownerId: ownerId || undefined,
      email,
    };
  }

  /**
   * Check if tenant has specific permission
   */
  static hasPermission(
    context: TenantContext,
    permission: PermissionString
  ): boolean {
    return context.permissions.includes(permission);
  }

  /**
   * Check if tenant has any of the specified permissions
   */
  static hasAnyPermission(
    context: TenantContext,
    permissions: PermissionString[]
  ): boolean {
    return permissions.some((permission) =>
      context.permissions.includes(permission)
    );
  }

  /**
   * Check if tenant has admin-level permissions (can read all buildings)
   */
  static isAdmin(context: TenantContext): boolean {
    return this.hasPermission(context, "buildings:read:all");
  }

  /**
   * Check if tenant has owner-level permissions (can read own apartments)
   */
  static isOwner(context: TenantContext): boolean {
    return this.hasPermission(context, "apartments:read:own");
  }
}
