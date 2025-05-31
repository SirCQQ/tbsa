/**
 * Permission types and utilities
 * Re-exports from constants and additional type helpers
 */

import { type PermissionString } from "../lib/constants/permissions";

export type {
  PermissionString as Permission,
  PermissionsByResource,
} from "../lib/constants/permissions";

export {
  PermissionResource,
  PermissionAction,
  PermissionScope,
  AppRoutes,
  ApiRoutes,
  COMMON_PERMISSIONS,
  PERMISSIONS_BY_RESOURCE,
  ALL_PERMISSIONS,
  PermissionHelpers,
  createPermissionString,
  parsePermissionString,
  API_PERMISSIONS,
  PAGE_PERMISSIONS,
  NAVIGATION_PERMISSIONS,
} from "../lib/constants/permissions";

/**
 * User permissions interface
 */
export type UserPermissions = {
  userId: string;
  roleId: string;
  roleName: string;
  permissions: PermissionString[];
};

/**
 * Permission check interface
 */
export type PermissionCheck = {
  resource: string;
  action: string;
  scope?: string | null;
};
