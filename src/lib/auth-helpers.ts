import { prisma } from "@/lib/prisma";
import type {
  PermissionString,
  RoleString,
  UserOrganizationWithDetails,
} from "@/types/next-auth";

/**
 * Helper functions to fetch full data when simplified session data isn't enough
 */

export async function getFullPermissionsByCode(
  permissionCodes: string[]
): Promise<PermissionString[]> {
  const permissions = await prisma.permission.findMany({
    where: {
      code: {
        in: permissionCodes,
      },
    },
  });

  return permissions.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    resource: p.resource,
    action: p.action,
    description: p.description,
  }));
}

export async function getFullRolesByCode(
  roleCodes: string[]
): Promise<RoleString[]> {
  const roles = await prisma.role.findMany({
    where: {
      code: {
        in: roleCodes,
      },
    },
  });

  return roles.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    description: r.description,
  }));
}

export async function getFullOrganizationsByIds(
  organizationIds: string[]
): Promise<UserOrganizationWithDetails[]> {
  const organizations = await prisma.organization.findMany({
    where: {
      id: {
        in: organizationIds,
      },
    },
  });

  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    code: org.code,
    description: org.description,
  }));
}

// Helper function to check permissions server-side with full data
export async function hasPermissionServerSide(
  permissionCodes: string[],
  resource: string,
  action: string
): Promise<boolean> {
  const permissionCode = `${resource}:${action}`;
  return permissionCodes.includes(permissionCode);
}

// Helper function to check multiple permissions
export async function hasAnyPermissionServerSide(
  permissionCodes: string[],
  permissions: Array<{ resource: string; action: string }>
): Promise<boolean> {
  return permissions.some(({ resource, action }) =>
    hasPermissionServerSide(permissionCodes, resource, action)
  );
}

export async function hasAllPermissionsServerSide(
  permissionCodes: string[],
  permissions: Array<{ resource: string; action: string }>
): Promise<boolean> {
  return permissions.every(({ resource, action }) =>
    hasPermissionServerSide(permissionCodes, resource, action)
  );
}

// Helper function to check roles
export async function hasRoleServerSide(
  roleCodes: string[],
  roleName: string
): Promise<boolean> {
  return roleCodes.includes(roleName);
}
