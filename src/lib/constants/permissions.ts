/**
 * Centralized permissions and routes configuration
 * This file contains all API endpoints and pages with their required permissions
 */

import {
  PermissionResource,
  PermissionAction,
  PermissionScope,
} from "@prisma/client";

// Application Routes Enums
export enum AppRoutes {
  // Public routes
  HOME = "/",
  LOGIN = "/login",
  REGISTER = "/register",
  PRIVACY = "/privacy",
  TERMS = "/terms",

  // Authenticated routes
  PROFILE = "/profile",
  DASHBOARD = "/dashboard",
  APARTMENTS = "/dashboard/apartments",

  // Admin routes
  ADMIN_DASHBOARD = "/dashboard/admin",
  ADMIN_PERMISSIONS = "/dashboard/admin/permissions",
  ADMIN_BUILDINGS = "/dashboard/admin/buildings",
  ADMIN_BUILDING_DETAILS = "/dashboard/admin/buildings/[id]",
  ADMIN_INVITE_CODES = "/dashboard/admin/invite-codes",
  ADMIN_USERS = "/dashboard/admin/users",

  // Building management routes
  BUILDINGS = "/dashboard/buildings",
  BUILDING_DETAILS = "/dashboard/buildings/[id]",
  BUILDING_APARTMENTS = "/dashboard/buildings/[id]/apartments",

  // Water readings routes
  WATER_READINGS = "/dashboard/water-readings",
  WATER_READINGS_SUBMIT = "/dashboard/water-readings/submit",
  WATER_READINGS_VALIDATE = "/dashboard/water-readings/validate",

  // Invite codes routes
  INVITE_CODES = "/dashboard/invite-codes",
}

export enum ApiRoutes {
  // Health check
  HEALTH = "/api/health",

  // Authentication
  AUTH_LOGIN = "/api/auth/login",
  AUTH_LOGOUT = "/api/auth/logout",
  AUTH_REGISTER = "/api/auth/register",
  AUTH_REFRESH = "/api/auth/refresh",
  AUTH_SESSIONS = "/api/auth/sessions",
  AUTH_SESSIONS_ID = "/api/auth/sessions/[id]",

  // Buildings API
  BUILDINGS = "/api/buildings",
  BUILDINGS_ID = "/api/buildings/[id]",
  BUILDINGS_ID_APARTMENTS = "/api/buildings/[id]/apartments",

  // Apartments API
  APARTMENTS = "/api/apartments",
  APARTMENTS_ID = "/api/apartments/[id]",

  // Users API
  USERS = "/api/users",
  USERS_ID = "/api/users/[id]",

  // Water Readings API
  WATER_READINGS = "/api/water-readings",
  WATER_READINGS_ID = "/api/water-readings/[id]",
  WATER_READINGS_SUBMIT = "/api/water-readings/submit",
  WATER_READINGS_VALIDATE = "/api/water-readings/validate",

  // Invite Codes API
  INVITE_CODES = "/api/invite-codes",
  INVITE_CODES_ID = "/api/invite-codes/[id]",
  INVITE_CODES_VALIDATE = "/api/invite-codes/validate",

  // Permissions API
  PERMISSIONS = "/api/permissions",
  PERMISSIONS_CHECK = "/api/permissions/check",
  PERMISSIONS_ROLES = "/api/permissions/roles",
  PERMISSIONS_ROLES_ID = "/api/permissions/roles/[id]",
  PERMISSIONS_ADMIN_GRANT = "/api/permissions/admin-grant",
  PERMISSIONS_USERS = "/api/permissions/users",

  // Test endpoints
  TEST_JWT = "/api/test-jwt",
}

export type PermissionString =
  | `${PermissionResource}:${PermissionAction}:${PermissionScope}`
  | `${PermissionResource}:${PermissionAction}`;

// Commonly used permission sets for easier reference
export const COMMON_PERMISSIONS = {
  // Super admin - all permissions
  SUPER_ADMIN: [
    "buildings:read:all",
    "buildings:create:all",
    "buildings:update:all",
    "buildings:delete:all",
    "apartments:read:all",
    "apartments:create:all",
    "apartments:update:all",
    "apartments:delete:all",
    "users:read:all",
    "users:create:all",
    "users:update:all",
    "users:delete:all",
    "water_readings:read:all",
    "water_readings:create:all",
    "water_readings:update:all",
    "water_readings:delete:all",
    "invite_codes:read:all",
    "invite_codes:create:all",
    "invite_codes:update:all",
    "invite_codes:delete:all",
    "roles:read:all",
    "roles:create:all",
    "roles:update:all",
    "roles:delete:all",
    "admin_grant:read:all",
    "admin_grant:create:all",
    "admin_grant:update:all",
    "admin_grant:delete:all",
  ] as PermissionString[],

  // Building administrator
  ADMINISTRATOR: [
    "buildings:read:own",
    "buildings:update:own",
    "apartments:read:building",
    "apartments:create:building",
    "apartments:update:building",
    "apartments:delete:building",
    "users:read:building",
    "users:create:building",
    "users:update:building",
    "water_readings:read:building",
    "water_readings:update:building",
    "invite_codes:read:building",
    "invite_codes:create:building",
    "invite_codes:update:building",
    "invite_codes:delete:building",
  ] as PermissionString[],

  // Basic user/owner
  BASIC_USER: [
    "apartments:read:own",
    "apartments:update:own",
    "water_readings:read:own",
    "water_readings:create:own",
    "water_readings:update:own",
    "users:read:own",
    "users:update:own",
  ] as PermissionString[],
} as const;

// Permission categories for better organization
export type PermissionsByResource = {
  buildings: PermissionString[];
  apartments: PermissionString[];
  users: PermissionString[];
  water_readings: PermissionString[];
  invite_codes: PermissionString[];
  roles: PermissionString[];
  admin_grant: PermissionString[];
};

// All permissions organized by resource
export const PERMISSIONS_BY_RESOURCE: PermissionsByResource = {
  buildings: [
    "buildings:read:all",
    "buildings:read:own",
    "buildings:read:building",
    "buildings:create:all",
    "buildings:create:own",
    "buildings:create:building",
    "buildings:update:all",
    "buildings:update:own",
    "buildings:update:building",
    "buildings:delete:all",
    "buildings:delete:own",
    "buildings:delete:building",
  ],
  apartments: [
    "apartments:read:all",
    "apartments:read:own",
    "apartments:read:building",
    "apartments:create:all",
    "apartments:create:own",
    "apartments:create:building",
    "apartments:update:all",
    "apartments:update:own",
    "apartments:update:building",
    "apartments:delete:all",
    "apartments:delete:own",
    "apartments:delete:building",
  ],
  users: [
    "users:read:all",
    "users:read:own",
    "users:read:building",
    "users:create:all",
    "users:create:own",
    "users:create:building",
    "users:update:all",
    "users:update:own",
    "users:update:building",
    "users:delete:all",
    "users:delete:own",
    "users:delete:building",
  ],
  water_readings: [
    "water_readings:read:all",
    "water_readings:read:own",
    "water_readings:read:building",
    "water_readings:create:all",
    "water_readings:create:own",
    "water_readings:create:building",
    "water_readings:update:all",
    "water_readings:update:own",
    "water_readings:update:building",
    "water_readings:delete:all",
    "water_readings:delete:own",
    "water_readings:delete:building",
  ],
  invite_codes: [
    "invite_codes:read:all",
    "invite_codes:read:own",
    "invite_codes:read:building",
    "invite_codes:create:all",
    "invite_codes:create:own",
    "invite_codes:create:building",
    "invite_codes:update:all",
    "invite_codes:update:own",
    "invite_codes:update:building",
    "invite_codes:delete:all",
    "invite_codes:delete:own",
    "invite_codes:delete:building",
  ],
  roles: [
    "roles:read:all",
    "roles:read:own",
    "roles:read:building",
    "roles:create:all",
    "roles:create:own",
    "roles:create:building",
    "roles:update:all",
    "roles:update:own",
    "roles:update:building",
    "roles:delete:all",
    "roles:delete:own",
    "roles:delete:building",
  ],
  admin_grant: [
    "admin_grant:read:all",
    "admin_grant:read:own",
    "admin_grant:read:building",
    "admin_grant:create:all",
    "admin_grant:create:own",
    "admin_grant:create:building",
    "admin_grant:update:all",
    "admin_grant:update:own",
    "admin_grant:update:building",
    "admin_grant:delete:all",
    "admin_grant:delete:own",
    "admin_grant:delete:building",
  ],
};

// Get all permissions as a flat array
export const ALL_PERMISSIONS: PermissionString[] = Object.values(
  PERMISSIONS_BY_RESOURCE
).flat();

// Export Prisma enum types for use in other parts of the application
export { PermissionResource, PermissionAction, PermissionScope };

/**
 * Helper to create permission string from enum values
 */
export const createPermissionString = (
  resource: PermissionResource,
  action: PermissionAction,
  scope?: PermissionScope | null
): PermissionString => {
  if (scope) {
    return `${resource}:${action}:${scope}` as PermissionString;
  }
  return `${resource}:${action}` as PermissionString;
};

/**
 * Helper to parse permission string into enum values
 */
export const parsePermissionString = (
  permission: PermissionString
): {
  resource: PermissionResource;
  action: PermissionAction;
  scope?: PermissionScope | null;
} => {
  const parts = permission.split(":");
  const resource = parts[0] as PermissionResource;
  const action = parts[1] as PermissionAction;
  const scope = parts[2] ? (parts[2] as PermissionScope) : null;

  return { resource, action, scope };
};

// Types for configuration objects
type RouteConfig = {
  permissions: PermissionString[];
  description: string;
  requiresAny?: boolean;
};

type NavigationConfig = {
  permissions: PermissionString[];
  label: string;
  href: string;
  requiresAny?: boolean;
};

type ApiEndpointConfig = {
  GET?: PermissionString[];
  POST?: PermissionString[];
  PUT?: PermissionString[];
  DELETE?: PermissionString[];
};

/**
 * API Endpoints with required permissions
 */
export const API_PERMISSIONS: Record<ApiRoutes, ApiEndpointConfig> = {
  // Buildings API
  [ApiRoutes.BUILDINGS]: {
    GET: ["buildings:read:all", "buildings:read:own"],
    POST: ["buildings:create:all"],
  },
  [ApiRoutes.BUILDINGS_ID]: {
    GET: ["buildings:read:all", "buildings:read:own"],
    PUT: ["buildings:update:all", "buildings:update:own"],
    DELETE: ["buildings:delete:all"],
  },
  [ApiRoutes.BUILDINGS_ID_APARTMENTS]: {
    GET: ["apartments:read:all", "apartments:read:building"],
    POST: ["apartments:create:all", "apartments:create:building"],
  },

  // Apartments API
  [ApiRoutes.APARTMENTS]: {
    GET: ["apartments:read:all", "apartments:read:own"],
    POST: ["apartments:create:all"],
  },
  [ApiRoutes.APARTMENTS_ID]: {
    GET: ["apartments:read:all", "apartments:read:own"],
    PUT: ["apartments:update:all", "apartments:update:own"],
    DELETE: ["apartments:delete:all"],
  },

  // Users API
  [ApiRoutes.USERS]: {
    GET: ["users:read:all"],
    POST: ["users:create:all"],
  },
  [ApiRoutes.USERS_ID]: {
    GET: ["users:read:all", "users:read:own"],
    PUT: ["users:update:all", "users:update:own"],
    DELETE: ["users:delete:all"],
  },

  // Water Readings API
  [ApiRoutes.WATER_READINGS]: {
    GET: ["water_readings:read:all", "water_readings:read:building"],
    POST: ["water_readings:create:all", "water_readings:create:own"],
  },
  [ApiRoutes.WATER_READINGS_ID]: {
    GET: ["water_readings:read:all", "water_readings:read:building"],
    PUT: ["water_readings:update:all", "water_readings:update:own"],
    DELETE: ["water_readings:delete:all"],
  },
  [ApiRoutes.WATER_READINGS_SUBMIT]: {
    POST: ["water_readings:create:own"],
  },
  [ApiRoutes.WATER_READINGS_VALIDATE]: {
    POST: ["water_readings:update:all"],
  },

  // Invite Codes API
  [ApiRoutes.INVITE_CODES]: {
    GET: ["invite_codes:read:all", "invite_codes:read:building"],
    POST: ["invite_codes:create:all", "invite_codes:create:building"],
  },
  [ApiRoutes.INVITE_CODES_ID]: {
    GET: ["invite_codes:read:all", "invite_codes:read:building"],
    PUT: ["invite_codes:update:all"],
    DELETE: ["invite_codes:delete:all"],
  },
  [ApiRoutes.INVITE_CODES_VALIDATE]: {
    POST: [], // Public endpoint
  },

  // Permissions API
  [ApiRoutes.PERMISSIONS]: {
    GET: ["roles:read:all"],
  },
  [ApiRoutes.PERMISSIONS_CHECK]: {
    POST: [], // Used by PermissionGuard - needs to be accessible
  },
  [ApiRoutes.PERMISSIONS_ROLES]: {
    GET: ["roles:read:all"],
    POST: ["roles:create:all"],
  },
  [ApiRoutes.PERMISSIONS_ROLES_ID]: {
    GET: ["roles:read:all"],
    PUT: ["roles:update:all"],
    DELETE: ["roles:delete:all"],
  },
  [ApiRoutes.PERMISSIONS_ADMIN_GRANT]: {
    POST: ["admin_grant:create:all"],
  },
  [ApiRoutes.PERMISSIONS_USERS]: {
    GET: ["users:read:all"],
  },

  // Authentication API (mostly public)
  [ApiRoutes.AUTH_LOGIN]: {
    POST: [], // Public endpoint
  },
  [ApiRoutes.AUTH_LOGOUT]: {
    POST: [], // Public endpoint
  },
  [ApiRoutes.AUTH_REGISTER]: {
    POST: [], // Public endpoint
  },
  [ApiRoutes.AUTH_REFRESH]: {
    POST: [], // Public endpoint
  },
  [ApiRoutes.AUTH_SESSIONS]: {
    GET: [], // Authenticated but no specific permission required
    DELETE: [], // Authenticated but no specific permission required
  },
  [ApiRoutes.AUTH_SESSIONS_ID]: {
    DELETE: [], // Authenticated but no specific permission required
  },

  // Health check
  [ApiRoutes.HEALTH]: {
    GET: [], // Public endpoint
  },

  // Test endpoints
  [ApiRoutes.TEST_JWT]: {
    GET: [], // Test endpoint
  },
} as const;

/**
 * Page routes with required permissions
 */
export const PAGE_PERMISSIONS: Record<AppRoutes, RouteConfig> = {
  // Public routes (no permissions required)
  [AppRoutes.HOME]: {
    permissions: [],
    description: "Landing page - public access",
  },
  [AppRoutes.LOGIN]: {
    permissions: [],
    description: "Login page - public access",
  },
  [AppRoutes.REGISTER]: {
    permissions: [],
    description: "Registration page - public access",
  },
  [AppRoutes.PRIVACY]: {
    permissions: [],
    description: "Privacy policy page - public access",
  },
  [AppRoutes.TERMS]: {
    permissions: [],
    description: "Terms of service page - public access",
  },

  // Authenticated routes
  [AppRoutes.PROFILE]: {
    permissions: ["users:read:own", "users:update:own"],
    description: "User profile page",
    requiresAny: true,
  },
  [AppRoutes.DASHBOARD]: {
    permissions: [], // Base dashboard - access controlled by components
    description: "Main dashboard - access varies by user role and permissions",
  },
  [AppRoutes.APARTMENTS]: {
    permissions: ["apartments:read:own", "apartments:read:building"],
    description: "User apartments page",
    requiresAny: true,
  },

  // Admin pages
  [AppRoutes.ADMIN_DASHBOARD]: {
    permissions: [
      "buildings:read:all",
      "users:read:all",
      "roles:read:all",
      "admin_grant:read:all",
    ],
    description: "Admin dashboard - requires admin-level permissions",
    requiresAny: true, // User needs ANY of these permissions, not all
  },
  [AppRoutes.ADMIN_PERMISSIONS]: {
    permissions: ["roles:read:all"],
    description: "Permissions management page",
  },
  [AppRoutes.ADMIN_BUILDINGS]: {
    permissions: ["buildings:read:all"],
    description: "Buildings management page",
  },
  [AppRoutes.ADMIN_BUILDING_DETAILS]: {
    permissions: ["buildings:read:all", "buildings:read:own"],
    description: "Building details page",
    requiresAny: true,
  },
  [AppRoutes.ADMIN_INVITE_CODES]: {
    permissions: ["invite_codes:read:all", "invite_codes:create:all"],
    description: "Admin invite codes management page",
    requiresAny: true,
  },
  [AppRoutes.ADMIN_USERS]: {
    permissions: ["users:read:all"],
    description: "Users management page",
  },

  // Building management pages
  [AppRoutes.BUILDINGS]: {
    permissions: ["buildings:read:all", "buildings:read:own"],
    description: "Buildings list page",
    requiresAny: true,
  },
  [AppRoutes.BUILDING_DETAILS]: {
    permissions: ["buildings:read:all", "buildings:read:own"],
    description: "Building details page",
    requiresAny: true,
  },
  [AppRoutes.BUILDING_APARTMENTS]: {
    permissions: [
      "apartments:read:all",
      "apartments:read:own",
      "buildings:read:all",
      "buildings:read:own",
    ],
    description: "Building apartments page",
    requiresAny: true,
  },

  // Water readings pages
  [AppRoutes.WATER_READINGS]: {
    permissions: [
      "water_readings:read:all",
      "water_readings:read:building",
      "water_readings:create:own",
    ],
    description: "Water readings page",
    requiresAny: true,
  },
  [AppRoutes.WATER_READINGS_SUBMIT]: {
    permissions: ["water_readings:create:own"],
    description: "Submit water reading page",
  },
  [AppRoutes.WATER_READINGS_VALIDATE]: {
    permissions: ["water_readings:update:all"],
    description: "Validate water readings page",
  },

  // Invite codes pages
  [AppRoutes.INVITE_CODES]: {
    permissions: [
      "invite_codes:read:all",
      "invite_codes:read:building",
      "invite_codes:create:all",
      "invite_codes:create:building",
    ],
    description: "Invite codes management page",
    requiresAny: true,
  },
} as const;

/**
 * Navigation items with required permissions
 */
export const NAVIGATION_PERMISSIONS: Record<string, NavigationConfig> = {
  // Main navigation
  dashboard: {
    permissions: [], // Always visible when authenticated
    label: "Dashboard",
    href: AppRoutes.DASHBOARD,
  },
  profile: {
    permissions: ["users:read:own"],
    label: "Profil",
    href: AppRoutes.PROFILE,
  },
  apartments: {
    permissions: ["apartments:read:own", "apartments:read:building"],
    label: "Apartamente",
    href: AppRoutes.APARTMENTS,
    requiresAny: true,
  },
  buildings: {
    permissions: ["buildings:read:all", "buildings:read:own"],
    label: "Clădiri",
    href: AppRoutes.BUILDINGS,
    requiresAny: true,
  },
  waterReadings: {
    permissions: [
      "water_readings:read:all",
      "water_readings:read:building",
      "water_readings:create:own",
    ],
    label: "Citiri Apă",
    href: AppRoutes.WATER_READINGS,
    requiresAny: true,
  },
  inviteCodes: {
    permissions: [
      "invite_codes:read:all",
      "invite_codes:read:building",
      "invite_codes:create:all",
      "invite_codes:create:building",
    ],
    label: "Coduri Invitație",
    href: AppRoutes.INVITE_CODES,
    requiresAny: true,
  },

  // Admin navigation
  adminDashboard: {
    permissions: [
      "buildings:read:all",
      "users:read:all",
      "roles:read:all",
      "admin_grant:read:all",
    ],
    label: "Admin",
    href: AppRoutes.ADMIN_DASHBOARD,
    requiresAny: true,
  },
  adminPermissions: {
    permissions: ["roles:read:all"],
    label: "Permisiuni",
    href: AppRoutes.ADMIN_PERMISSIONS,
  },
  adminBuildings: {
    permissions: ["buildings:read:all"],
    label: "Clădiri",
    href: AppRoutes.ADMIN_BUILDINGS,
  },
  adminUsers: {
    permissions: ["users:read:all"],
    label: "Utilizatori",
    href: AppRoutes.ADMIN_USERS,
  },
  adminInviteCodes: {
    permissions: ["invite_codes:read:all", "invite_codes:create:all"],
    label: "Coduri Invitație",
    href: AppRoutes.ADMIN_INVITE_CODES,
    requiresAny: true,
  },
} as const;

/**
 * Helper functions for permission checking
 */
export const PermissionHelpers = {
  /**
   * Check if user has any of the required permissions for a route
   */
  hasRouteAccess: (userPermissions: string[], route: AppRoutes): boolean => {
    const routeConfig = PAGE_PERMISSIONS[route];
    if (!routeConfig || routeConfig.permissions.length === 0) {
      return true; // No permissions required
    }

    if (routeConfig.requiresAny) {
      return routeConfig.permissions.some((permission: PermissionString) =>
        userPermissions.includes(permission)
      );
    }

    return routeConfig.permissions.every((permission: PermissionString) =>
      userPermissions.includes(permission)
    );
  },

  /**
   * Check if user has any of the required permissions for an API endpoint
   */
  hasApiAccess: (
    userPermissions: string[],
    endpoint: ApiRoutes,
    method: keyof ApiEndpointConfig
  ): boolean => {
    const endpointConfig = API_PERMISSIONS[endpoint];
    if (!endpointConfig || !endpointConfig[method]) {
      return false;
    }

    const requiredPermissions = endpointConfig[method];
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Public endpoint
    }

    return requiredPermissions.some((permission: PermissionString) =>
      userPermissions.includes(permission)
    );
  },

  /**
   * Check if user should see a navigation item
   */
  hasNavigationAccess: (
    userPermissions: string[],
    navItem: string
  ): boolean => {
    const navConfig = NAVIGATION_PERMISSIONS[navItem];
    if (!navConfig || navConfig.permissions.length === 0) {
      return true;
    }

    if (navConfig.requiresAny) {
      return navConfig.permissions.some((permission: PermissionString) =>
        userPermissions.includes(permission)
      );
    }

    return navConfig.permissions.every((permission: PermissionString) =>
      userPermissions.includes(permission)
    );
  },

  /**
   * Get all permissions for a specific resource
   */
  getResourcePermissions: (
    resource: keyof PermissionsByResource
  ): PermissionString[] => {
    return PERMISSIONS_BY_RESOURCE[resource];
  },

  /**
   * Check if user has permission for a specific resource and action
   */
  hasResourceAccess: (
    userPermissions: string[],
    resource: PermissionResource,
    action: PermissionAction,
    scope?: PermissionScope | null
  ): boolean => {
    const permission = createPermissionString(resource, action, scope);
    return userPermissions.includes(permission);
  },

  /**
   * Get permissions by action (read, create, update, delete)
   */
  getPermissionsByAction: (action: PermissionAction): PermissionString[] => {
    return ALL_PERMISSIONS.filter((permission) =>
      permission.includes(`:${action}:`)
    );
  },

  /**
   * Get permissions by scope (all, own, building)
   */
  getPermissionsByScope: (scope: PermissionScope): PermissionString[] => {
    return ALL_PERMISSIONS.filter((permission) =>
      permission.endsWith(`:${scope}`)
    );
  },

  /**
   * Check if a permission string is valid
   */
  isValidPermission: (permission: string): permission is PermissionString => {
    return ALL_PERMISSIONS.includes(permission as PermissionString);
  },

  /**
   * Get user's permissions for a specific resource
   */
  getUserResourcePermissions: (
    userPermissions: string[],
    resource: keyof PermissionsByResource
  ): PermissionString[] => {
    const resourcePermissions = PERMISSIONS_BY_RESOURCE[resource];
    return resourcePermissions.filter((permission) =>
      userPermissions.includes(permission)
    );
  },

  /**
   * Check if user has admin-level permissions (any 'all' scope permission)
   */
  hasAdminPermissions: (userPermissions: string[]): boolean => {
    return userPermissions.some((permission) => permission.endsWith(":all"));
  },

  /**
   * Check if user has super admin permissions (all admin_grant permissions)
   */
  hasSuperAdminPermissions: (userPermissions: string[]): boolean => {
    const adminGrantPermissions = PERMISSIONS_BY_RESOURCE.admin_grant.filter(
      (p) => p.endsWith(":all")
    );
    return adminGrantPermissions.every((permission) =>
      userPermissions.includes(permission)
    );
  },

  /**
   * Get route configuration for a specific route
   */
  getRouteConfig: (route: AppRoutes): RouteConfig | undefined => {
    return PAGE_PERMISSIONS[route];
  },

  /**
   * Get API endpoint configuration for a specific endpoint
   */
  getApiConfig: (endpoint: ApiRoutes): ApiEndpointConfig | undefined => {
    return API_PERMISSIONS[endpoint];
  },

  /**
   * Get navigation configuration for a specific nav item
   */
  getNavigationConfig: (navItem: string): NavigationConfig | undefined => {
    return NAVIGATION_PERMISSIONS[navItem];
  },

  /**
   * Get all app routes as an array
   */
  getAllAppRoutes: (): AppRoutes[] => {
    return Object.values(AppRoutes);
  },

  /**
   * Get all API routes as an array
   */
  getAllApiRoutes: (): ApiRoutes[] => {
    return Object.values(ApiRoutes);
  },

  /**
   * Check if a string is a valid app route
   */
  isValidAppRoute: (route: string): route is AppRoutes => {
    return Object.values(AppRoutes).includes(route as AppRoutes);
  },

  /**
   * Check if a string is a valid API route
   */
  isValidApiRoute: (route: string): route is ApiRoutes => {
    return Object.values(ApiRoutes).includes(route as ApiRoutes);
  },
} as const;
