/**
 * Examples of using the permissions system with route enums
 * This file demonstrates best practices for working with permissions and routes
 */

import {
  AppRoutes,
  ApiRoutes,
  PermissionString,
  PermissionHelpers,
  API_PERMISSIONS,
  PAGE_PERMISSIONS,
  NAVIGATION_PERMISSIONS,
} from "./permissions";

// Example 1: Route Navigation with Type Safety
export function navigateToAdminDashboard() {
  // ✅ DO: Use enum for type safety
  const route = AppRoutes.ADMIN_DASHBOARD;

  // ❌ DON'T: Use hardcoded strings
  // const route = "/dashboard/admin";

  return route;
}

// Example 2: API Endpoint Construction
export function buildApiUrl(baseUrl: string, endpoint: ApiRoutes) {
  // ✅ DO: Use enum for consistent API endpoints
  return `${baseUrl}${endpoint}`;
}

// Example 3: Permission Checking for Routes
export function checkRouteAccess(
  userPermissions: string[],
  route: AppRoutes
): boolean {
  // ✅ DO: Use helper function with enum
  return PermissionHelpers.hasRouteAccess(userPermissions, route);
}

// Example 4: API Permission Checking
export function checkApiAccess(
  userPermissions: string[],
  endpoint: ApiRoutes,
  method: "GET" | "POST" | "PUT" | "DELETE"
): boolean {
  // ✅ DO: Use helper function with enum
  return PermissionHelpers.hasApiAccess(userPermissions, endpoint, method);
}

// Example 5: Dynamic Route Configuration
export function getRoutePermissions(route: AppRoutes): PermissionString[] {
  const config = PermissionHelpers.getRouteConfig(route);
  return config?.permissions || [];
}

// Example 6: Navigation Menu Generation
export function generateNavigationMenu(userPermissions: string[]) {
  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      route: AppRoutes.DASHBOARD,
      permissions: [],
    },
    {
      key: "buildings",
      label: "Clădiri",
      route: AppRoutes.BUILDINGS,
      permissions: [
        "buildings:read:all",
        "buildings:read:own",
      ] as PermissionString[],
    },
    {
      key: "admin",
      label: "Admin",
      route: AppRoutes.ADMIN_DASHBOARD,
      permissions: ["roles:read:all", "users:read:all"] as PermissionString[],
    },
  ];

  return menuItems.filter((item) => {
    if (item.permissions.length === 0) return true;
    return item.permissions.some((permission) =>
      userPermissions.includes(permission)
    );
  });
}

// Example 7: API Client with Route Enums
export class ApiClient {
  constructor(private baseUrl: string) {}

  // ✅ DO: Use enum for endpoint parameter
  async get(endpoint: ApiRoutes, userPermissions: string[]) {
    // Check permissions before making request
    if (!PermissionHelpers.hasApiAccess(userPermissions, endpoint, "GET")) {
      throw new Error("Insufficient permissions");
    }

    const url = `${this.baseUrl}${endpoint}`;
    return fetch(url, { method: "GET" });
  }

  async post(endpoint: ApiRoutes, data: unknown, userPermissions: string[]) {
    if (!PermissionHelpers.hasApiAccess(userPermissions, endpoint, "POST")) {
      throw new Error("Insufficient permissions");
    }

    const url = `${this.baseUrl}${endpoint}`;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
}

// Example 8: Route Guard Hook (for React)
export function useRouteGuard(route: AppRoutes, userPermissions: string[]) {
  const hasAccess = PermissionHelpers.hasRouteAccess(userPermissions, route);
  const config = PermissionHelpers.getRouteConfig(route);

  return {
    hasAccess,
    requiredPermissions: config?.permissions || [],
    description: config?.description || "",
    requiresAny: config?.requiresAny || false,
  };
}

// Example 9: Permission-based Component Rendering
export function shouldRenderComponent(
  permission: PermissionString,
  userPermissions: string[]
): boolean {
  return userPermissions.includes(permission);
}

// Example 10: Bulk Permission Checking
export function checkMultiplePermissions(
  userPermissions: string[],
  requiredPermissions: PermissionString[],
  requireAll: boolean = false
): boolean {
  if (requireAll) {
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );
  }
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

// Example 11: Route Validation
export function validateRoute(route: string): {
  isValid: boolean;
  type: "app" | "api" | "unknown";
  enum?: AppRoutes | ApiRoutes;
} {
  if (PermissionHelpers.isValidAppRoute(route)) {
    return {
      isValid: true,
      type: "app",
      enum: route as AppRoutes,
    };
  }

  if (PermissionHelpers.isValidApiRoute(route)) {
    return {
      isValid: true,
      type: "api",
      enum: route as ApiRoutes,
    };
  }

  return {
    isValid: false,
    type: "unknown",
  };
}

// Example 12: Configuration Inspection
export function inspectPermissionConfig() {
  return {
    totalAppRoutes: PermissionHelpers.getAllAppRoutes().length,
    totalApiRoutes: PermissionHelpers.getAllApiRoutes().length,
    totalPageConfigs: Object.keys(PAGE_PERMISSIONS).length,
    totalApiConfigs: Object.keys(API_PERMISSIONS).length,
    totalNavConfigs: Object.keys(NAVIGATION_PERMISSIONS).length,
  };
}

// Example 13: Permission Debugging
export function debugUserPermissions(
  userId: string,
  userPermissions: string[],
  targetRoute: AppRoutes
) {
  const config = PermissionHelpers.getRouteConfig(targetRoute);
  const hasAccess = PermissionHelpers.hasRouteAccess(
    userPermissions,
    targetRoute
  );

  return {
    userId,
    targetRoute,
    hasAccess,
    userPermissions,
    requiredPermissions: config?.permissions || [],
    requiresAny: config?.requiresAny || false,
    missingPermissions:
      config?.permissions.filter(
        (permission) => !userPermissions.includes(permission)
      ) || [],
  };
}

// Example 14: Type-safe Permission Constants
export const EXAMPLE_PERMISSIONS = {
  SUPER_ADMIN: [
    "buildings:read:all",
    "buildings:create:all",
    "buildings:update:all",
    "buildings:delete:all",
    "users:read:all",
    "users:create:all",
    "roles:read:all",
    "roles:create:all",
    "admin_grant:create:all",
  ] as PermissionString[],

  BUILDING_ADMIN: [
    "buildings:read:own",
    "buildings:update:own",
    "apartments:read:building",
    "apartments:create:building",
    "users:read:building",
    "invite_codes:create:building",
  ] as PermissionString[],

  BASIC_USER: [
    "apartments:read:own",
    "apartments:update:own",
    "water_readings:read:own",
    "water_readings:create:own",
    "users:read:own",
    "users:update:own",
  ] as PermissionString[],
} as const;

// Example 15: Route-based Breadcrumb Generation
export function generateBreadcrumbs(currentRoute: AppRoutes) {
  type BreadcrumbConfig = { label: string; parent?: AppRoutes };

  const breadcrumbMap: Partial<Record<AppRoutes, BreadcrumbConfig>> = {
    [AppRoutes.HOME]: { label: "Acasă" },
    [AppRoutes.DASHBOARD]: { label: "Dashboard" },
    [AppRoutes.ADMIN_DASHBOARD]: {
      label: "Admin",
      parent: AppRoutes.DASHBOARD,
    },
    [AppRoutes.ADMIN_BUILDINGS]: {
      label: "Clădiri",
      parent: AppRoutes.ADMIN_DASHBOARD,
    },
    [AppRoutes.ADMIN_PERMISSIONS]: {
      label: "Permisiuni",
      parent: AppRoutes.ADMIN_DASHBOARD,
    },
    [AppRoutes.BUILDINGS]: { label: "Clădiri", parent: AppRoutes.DASHBOARD },
    [AppRoutes.APARTMENTS]: {
      label: "Apartamente",
      parent: AppRoutes.DASHBOARD,
    },
    // Add more as needed...
  };

  const breadcrumbs: Array<{ route: AppRoutes; label: string }> = [];
  let current: AppRoutes | undefined = currentRoute;

  while (current) {
    const config = breadcrumbMap[current];
    if (config) {
      breadcrumbs.unshift({
        route: current,
        label: config.label,
      });
      current = config.parent;
    } else {
      break;
    }
  }

  return breadcrumbs;
}
