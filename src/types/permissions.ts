/**
 * Permission types and utilities
 * Re-exports from constants and additional type helpers
 */

import {
  COMMON_PERMISSIONS,
  type PermissionString,
} from "../lib/constants/permissions";

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

// Additional type utilities for permissions

/**
 * Extract resource from permission string
 */
export type ExtractResource<T extends string> =
  T extends `${infer R}:${string}:${string}`
    ? R
    : T extends `${infer R}:${string}`
    ? R
    : never;

/**
 * Extract action from permission string
 */
export type ExtractAction<T extends string> =
  T extends `${string}:${infer A}:${string}`
    ? A
    : T extends `${string}:${infer A}`
    ? A
    : never;

/**
 * Extract scope from permission string
 */
export type ExtractScope<T extends string> =
  T extends `${string}:${string}:${infer S}` ? S : null;

/**
 * Permission check result
 */
export type PermissionCheckResult = {
  hasPermission: boolean;
  missingPermissions?: string[];
  reason?: string;
};

/**
 * Permission context for scoped permissions
 */
export type PermissionContext = {
  userId?: string;
  buildingId?: string;
  apartmentId?: string;
  ownerId?: string;
  administratorId?: string;
};

/**
 * Role-based permission mapping
 */
export type RolePermissions = {
  SUPER_ADMIN: typeof COMMON_PERMISSIONS.SUPER_ADMIN;
  ADMINISTRATOR: typeof COMMON_PERMISSIONS.ADMINISTRATOR;
  BASIC_USER: typeof COMMON_PERMISSIONS.BASIC_USER;
};

/**
 * Permission validation schema
 */
export type PermissionValidation = {
  permission: string;
  isValid: boolean;
  resource?: string;
  action?: string;
  scope?: string | null;
  error?: string;
};

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
