import { prisma } from "@/lib/prisma";
import type { Role } from "@/types/next-auth";
import type { Permission } from "@prisma/client";

export const getPermissionString = (
  permission: Pick<Permission, "resource" | "action">
): string => {
  return `${permission.resource.toUpperCase()}:${permission.action.toUpperCase()}`;
};

export async function getFullRolesByCode(roleCodes: string[]): Promise<Role[]> {
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

// Helper function to check permissions server-side with full data
export async function hasPermissionServerSide(
  permissionCodes: string[],
  resource: string,
  action: string
): Promise<boolean> {
  const permissionCode = `${resource.toLocaleUpperCase()}:${action.toLocaleUpperCase()}`;
  return permissionCodes.includes(permissionCode);
}
