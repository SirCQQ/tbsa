import { headers } from "next/headers";
import { AuthService } from "@/services/auth.service";
import { PermissionService } from "@/services/permission.service";
import { type PermissionCheck } from "@/types/permission";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function getCurrentUser() {
  const headersList = await headers();
  const authToken = headersList.get("cookie")?.match(/auth-token=([^;]+)/)?.[1];

  if (!authToken) {
    throw new Error("No authentication token found");
  }

  const result = await AuthService.getCurrentUser(authToken);
  if (!result.success) {
    throw new Error(result.message || "Failed to get current user");
  }

  return result.data;
}

/**
 * Get JWT payload from auth token
 */
async function getJWTPayload() {
  const headersList = await headers();
  const authToken = headersList.get("cookie")?.match(/auth-token=([^;]+)/)?.[1];

  if (!authToken) {
    throw new Error("No authentication token found");
  }

  try {
    const { payload } = await jwtVerify(authToken, JWT_SECRET);
    return payload;
  } catch (_error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Get user permissions from JWT token
 */
async function getUserPermissions(): Promise<string[]> {
  try {
    const payload = await getJWTPayload();
    return (payload.permissions as string[]) || [];
  } catch (_error) {
    // If token verification fails, return empty permissions
    return [];
  }
}

/**
 * Check if user has permission using JWT data
 */
export async function hasPermission(check: PermissionCheck): Promise<boolean> {
  const permissions = await getUserPermissions();

  if (!permissions.length) {
    return false;
  }

  return PermissionService.hasPermissionFromString(permissions, check);
}

/**
 * Require permission or throw error
 */
export async function requirePermission(check: PermissionCheck): Promise<void> {
  const hasAccess = await hasPermission(check);
  if (!hasAccess) {
    throw new Error(
      `Permission denied: ${check.resource}:${check.action}:${
        check.scope || "null"
      }`
    );
  }
}
