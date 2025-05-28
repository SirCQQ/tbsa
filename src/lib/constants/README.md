# Permissions System Documentation

## Overview

This directory contains the centralized permissions system for the TBSA (Romanian Apartment Building Management) application. The system provides granular, role-based access control with TypeScript type safety and organized route management.

## Files Structure

- `permissions.ts` - Main permissions configuration, types, and route enums
- `index.ts` - Re-exports for easy importing

## Route Management

### Application Routes (AppRoutes)

The `AppRoutes` enum contains all page routes in the application:

```typescript
import { AppRoutes } from '@/lib/constants/permissions';

// Public routes
AppRoutes.HOME           // "/"
AppRoutes.LOGIN          // "/login"
AppRoutes.REGISTER       // "/register"
AppRoutes.PRIVACY        // "/privacy"
AppRoutes.TERMS          // "/terms"

// Authenticated routes
AppRoutes.PROFILE        // "/profile"
AppRoutes.DASHBOARD      // "/dashboard"
AppRoutes.APARTMENTS     // "/dashboard/apartments"

// Admin routes
AppRoutes.ADMIN_DASHBOARD     // "/dashboard/admin"
AppRoutes.ADMIN_PERMISSIONS   // "/dashboard/admin/permissions"
AppRoutes.ADMIN_BUILDINGS     // "/dashboard/admin/buildings"
// ... and more
```

### API Routes (ApiRoutes)

The `ApiRoutes` enum contains all API endpoints:

```typescript
import { ApiRoutes } from '@/lib/constants/permissions';

// Authentication
ApiRoutes.AUTH_LOGIN     // "/api/auth/login"
ApiRoutes.AUTH_LOGOUT    // "/api/auth/logout"

// Buildings API
ApiRoutes.BUILDINGS      // "/api/buildings"
ApiRoutes.BUILDINGS_ID   // "/api/buildings/[id]"

// Permissions API
ApiRoutes.PERMISSIONS_ROLES  // "/api/permissions/roles"
// ... and more
```

## Permission Format

Permissions follow the format: `resource:action:scope`

### Resources
- `buildings` - Building management
- `apartments` - Apartment management  
- `users` - User management
- `water_readings` - Water consumption readings
- `invite_codes` - Invitation code management
- `roles` - Role and permission management
- `admin_grant` - Administrative privileges

### Actions
- `read` - View/list resources
- `create` - Create new resources
- `update` - Modify existing resources
- `delete` - Remove resources

### Scopes
- `all` - Global access to all resources
- `own` - Access only to user's own resources
- `building` - Access to resources within managed buildings
- `null` - No scope restriction (for some permissions)

## Example Permissions

```typescript
"buildings:read:all"        // Read all buildings globally
"apartments:update:own"     // Update only own apartments
"water_readings:read:building" // Read water readings in managed buildings
"roles:create:all"          // Create roles globally
```

## Usage

### Basic Permission Check

```typescript
import { PermissionHelpers } from '@/lib/constants/permissions';

const userPermissions = ['buildings:read:all', 'apartments:update:own'];
const hasAccess = PermissionHelpers.hasResourceAccess(
  userPermissions,
  'buildings',
  'read',
  'all'
);
```

### Route Protection with Enums

```typescript
import { PermissionHelpers, AppRoutes } from '@/lib/constants/permissions';

const canAccessRoute = PermissionHelpers.hasRouteAccess(
  userPermissions,
  AppRoutes.ADMIN_BUILDINGS
);
```

### API Endpoint Protection with Enums

```typescript
import { PermissionHelpers, ApiRoutes } from '@/lib/constants/permissions';

const canCallAPI = PermissionHelpers.hasApiAccess(
  userPermissions,
  ApiRoutes.BUILDINGS,
  'GET'
);
```

### Component Permission Guards

```typescript
import { PermissionGuard } from '@/components/auth/permission-guard';

<PermissionGuard 
  permission="buildings:create:all"
  fallback={<p>No access</p>}
>
  <CreateBuildingButton />
</PermissionGuard>
```

### Navigation with Route Enums

```typescript
import { AppRoutes } from '@/lib/constants/permissions';
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push(AppRoutes.ADMIN_DASHBOARD);
```

## Configuration Objects

### API_PERMISSIONS
Maps API endpoints to required permissions by HTTP method using `ApiRoutes`:

```typescript
[ApiRoutes.BUILDINGS]: {
  GET: ["buildings:read:all", "buildings:read:own"],
  POST: ["buildings:create:all"],
  PUT: ["buildings:update:all", "buildings:update:own"],
  DELETE: ["buildings:delete:all"]
}
```

### PAGE_PERMISSIONS  
Maps page routes to required permissions using `AppRoutes`:

```typescript
[AppRoutes.ADMIN_BUILDINGS]: {
  permissions: ["buildings:read:all"],
  description: "Buildings management page"
}
```

### NAVIGATION_PERMISSIONS
Maps navigation items to required permissions using `AppRoutes`:

```typescript
adminBuildings: {
  permissions: ["buildings:read:all"],
  label: "Clădiri",
  href: AppRoutes.ADMIN_BUILDINGS
}
```

## Route Utilities

### Route Validation

```typescript
import { PermissionHelpers } from '@/lib/constants/permissions';

// Check if string is valid route
const isValidApp = PermissionHelpers.isValidAppRoute("/dashboard");
const isValidApi = PermissionHelpers.isValidApiRoute("/api/buildings");

// Get all routes
const allAppRoutes = PermissionHelpers.getAllAppRoutes();
const allApiRoutes = PermissionHelpers.getAllApiRoutes();
```

### Configuration Access

```typescript
import { PermissionHelpers, AppRoutes, ApiRoutes } from '@/lib/constants/permissions';

// Get route configuration
const routeConfig = PermissionHelpers.getRouteConfig(AppRoutes.ADMIN_BUILDINGS);
const apiConfig = PermissionHelpers.getApiConfig(ApiRoutes.BUILDINGS);
const navConfig = PermissionHelpers.getNavigationConfig("adminBuildings");
```

## Common Permission Sets

The system includes predefined permission sets for common roles:

### SUPER_ADMIN
- Full access to all resources and actions
- Can grant administrative privileges
- Global scope for all operations

### ADMINISTRATOR  
- Manage buildings they administer
- Full control over apartments in their buildings
- Manage users within their buildings
- Create and manage invite codes

### BASIC_USER
- Read and update own apartments
- Submit water readings for own apartments
- Update own user profile

## Type Safety

All permissions and routes are strongly typed using TypeScript:

```typescript
import type { Permission, AppRoutes, ApiRoutes } from '@/types/permissions';

// This will show autocomplete and type checking
const permission: Permission = "buildings:read:all"; // ✅ Valid
const route: AppRoutes = AppRoutes.ADMIN_DASHBOARD;  // ✅ Valid
const api: ApiRoutes = ApiRoutes.BUILDINGS;          // ✅ Valid

const invalid: Permission = "invalid:permission";    // ❌ Type error
```

## Best Practices

1. **Use Route Enums**: Always use `AppRoutes` and `ApiRoutes` enums instead of hardcoded strings
2. **Type-Safe Imports**: Always import types and constants from the main permissions module
3. **Granular Permissions**: Prefer specific permissions over broad access
4. **Scope Appropriately**: Use the most restrictive scope that meets requirements
5. **Document Custom Permissions**: Add new permissions to this documentation
6. **Test Permission Logic**: Verify permission checks work as expected
7. **Use Permission Guards**: Wrap UI components with PermissionGuard for conditional rendering
8. **Centralized Route Management**: Use enums for consistent route references across the app

## Adding New Routes

1. Add the route to the appropriate enum (`AppRoutes` or `ApiRoutes`) in `permissions.ts`
2. Add permissions mapping to the respective configuration object
3. Update navigation configuration if it's a user-facing route
4. Update this documentation
5. Use the enum value throughout the application instead of hardcoded strings

## Adding New Permissions

1. Add the permission string to the `Permission` type in `permissions.ts`
2. Add it to the appropriate resource array in `PERMISSIONS_BY_RESOURCE`
3. Update `COMMON_PERMISSIONS` if it should be included in standard roles
4. Add API/page mappings to the respective configuration objects
5. Update this documentation

## Migration Notes

When updating permissions or routes:
- Ensure database migrations include new permission records
- Update seed data to include new permissions for existing roles
- Replace hardcoded route strings with enum values
- Test that existing functionality continues to work
- Update component permission guards as needed 