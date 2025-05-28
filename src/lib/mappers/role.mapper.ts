import type { Role, Permission } from "@prisma/client";

export type RoleWithPermissions = Role & { permissions: Permission[] };

/**
 * Maps a role with permissions to API response format
 */
export function mapRoleToApiResponse(role: RoleWithPermissions) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissionCount: role.permissions.length,
    permissions: role.permissions.map((permission) => ({
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
    })),
  };
}

/**
 * Maps multiple roles to API response format
 */
export function mapRolesToApiResponse(roles: RoleWithPermissions[]) {
  return roles.map(mapRoleToApiResponse);
}

/**
 * Maps permission to API response format
 */
export function mapPermissionToApiResponse(permission: Permission) {
  return {
    id: permission.id,
    resource: permission.resource,
    action: permission.action,
    scope: permission.scope,
  };
}

/**
 * Maps multiple permissions to API response format
 */
export function mapPermissionsToApiResponse(permissions: Permission[]) {
  return permissions.map(mapPermissionToApiResponse);
}

/**
 * Maps role for select/dropdown components
 */
export function mapRoleForSelect(role: Role) {
  return {
    value: role.id,
    label: role.name,
    description: role.description,
    isSystem: role.isSystem,
  };
}

/**
 * Maps roles for select/dropdown components
 */
export function mapRolesForSelect(roles: Role[]) {
  return roles.map(mapRoleForSelect);
}
