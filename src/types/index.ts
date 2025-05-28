// Central type exports
export * from "./entities";

// Auth types - explicit exports to avoid conflicts
export type {
  UserRole,
  Permission as JWTPermission, // Rename to avoid conflict with permissions system
  User,
  AuthResponse,
  AuthSuccess,
  AuthError,
  LoginRequest,
  RegisterRequest,
  JWTPayload,
  Session,
  SessionFingerprint,
  RefreshTokenPayload,
  SessionInfo,
  SafeUser,
  UserWithoutPassword,
  AuthState,
} from "./auth";

export * from "./api";
export * from "./validations";

// Permissions types - explicit exports to avoid conflicts
export type {
  Permission, // This is the main Permission type for the permissions system
  PermissionsByResource,
  ExtractResource,
  ExtractAction,
  ExtractScope,
  PermissionCheckResult,
  PermissionContext,
  RolePermissions,
  PermissionValidation,
  UserPermissions,
  PermissionCheck,
} from "./permissions";

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
} from "./permissions";
