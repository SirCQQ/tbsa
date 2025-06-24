"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode, useCallback } from "react";

type PermissionGuardProps = {
  children: ReactNode;
  /** Array of permissions where ANY one must be satisfied (OR logic) */
  orPermissions?: string[];
  /** Array of permissions where ALL must be satisfied (AND logic) */
  andPermissions?: string[];
  /** Whether to redirect if permission check fails */
  withRedirect?: boolean;
  /** URL to redirect to if permission check fails (defaults to "/auth/login") */
  redirectUrl?: string;
  /** Optional fallback component to show if permission check fails and no redirect */
  fallback?: ReactNode;
  /** Optional loading component to show while checking permissions */
  loading?: ReactNode;
};

export function PermissionGuard({
  children,
  orPermissions,
  andPermissions,
  withRedirect = false,
  redirectUrl = "/auth/login",
  fallback = null,
  loading = null,
}: PermissionGuardProps) {
  const { user, isLoading, isAuthenticated, hasPermission } = useCurrentUser();

  const router = useRouter();

  // Helper function to parse permission string (resource:action format)
  const parsePermission = (
    permission: string
  ): { resource: string; action: string } => {
    const [resource, action] = permission.split(":");
    if (!resource || !action) {
      console.warn(
        `Invalid permission format: ${permission}. Expected format: "resource:action"`
      );
      return { resource: "", action: "" };
    }
    return { resource, action };
  };

  // Helper function to check a single permission
  const checkPermission = useCallback(
    (permission: string): boolean => {
      const { resource, action } = parsePermission(permission);
      if (!resource || !action) return false;
      return hasPermission(resource, action);
    },
    [hasPermission]
  );

  // Helper function to check OR permissions (any one must be satisfied)
  const checkOrPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some(checkPermission);
    },
    [checkPermission]
  );

  // Helper function to check AND permissions (all must be satisfied)
  const checkAndPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every(checkPermission);
    },
    [checkPermission]
  );

  // Main permission check logic
  const hasRequiredPermissions = useCallback((): boolean => {
    // If user is not authenticated, they don't have any permissions
    if (!isAuthenticated || !user) {
      return false;
    }

    // If no permissions are specified, allow access
    if (!orPermissions && !andPermissions) {
      return true;
    }

    let orResult = true;
    let andResult = true;

    // Check OR permissions (if specified)
    if (orPermissions && orPermissions.length > 0) {
      orResult = checkOrPermissions(orPermissions);
    }

    // Check AND permissions (if specified)
    if (andPermissions && andPermissions.length > 0) {
      andResult = checkAndPermissions(andPermissions);
    }

    // Both OR and AND conditions must be satisfied if both are specified
    return orResult && andResult;
  }, [
    isAuthenticated,
    user,
    orPermissions,
    andPermissions,
    checkOrPermissions,
    checkAndPermissions,
  ]);

  // Handle redirection when permission check fails
  useEffect(() => {
    if (!isLoading && withRedirect && !hasRequiredPermissions()) {
      router.push(redirectUrl);
    }
  }, [isLoading, withRedirect, redirectUrl, router, hasRequiredPermissions]);

  // Show loading state while checking permissions
  if (isLoading) {
    return loading ? <>{loading}</> : null;
  }

  // Check permissions
  const hasAccess = hasRequiredPermissions();

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If withRedirect is true, don't render anything (redirect will happen)
  if (withRedirect) {
    return null;
  }

  // Otherwise, render fallback component
  return fallback ? <>{fallback}</> : null;
}

// Convenience component for OR permissions only
export function PermissionGuardOr({
  children,
  permissions,
  ...props
}: Omit<PermissionGuardProps, "orPermissions" | "andPermissions"> & {
  permissions: string[];
}) {
  return (
    <PermissionGuard orPermissions={permissions} {...props}>
      {children}
    </PermissionGuard>
  );
}

// Convenience component for AND permissions only
export function PermissionGuardAnd({
  children,
  permissions,
  ...props
}: Omit<PermissionGuardProps, "orPermissions" | "andPermissions"> & {
  permissions: string[];
}) {
  return (
    <PermissionGuard andPermissions={permissions} {...props}>
      {children}
    </PermissionGuard>
  );
}

// Hook for checking permissions in components
export function usePermissions() {
  const { hasPermission, user, isAuthenticated } = useCurrentUser();

  const checkPermissions = (
    orPermissions?: string[],
    andPermissions?: string[]
  ): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    if (!orPermissions && !andPermissions) {
      return true;
    }

    const parsePermission = (
      permission: string
    ): { resource: string; action: string } => {
      const [resource, action] = permission.split(":");
      return { resource: resource || "", action: action || "" };
    };

    const checkPermission = (permission: string): boolean => {
      const { resource, action } = parsePermission(permission);
      if (!resource || !action) return false;
      return hasPermission(resource, action);
    };

    let orResult = true;
    let andResult = true;

    if (orPermissions && orPermissions.length > 0) {
      orResult = orPermissions.some(checkPermission);
    }

    if (andPermissions && andPermissions.length > 0) {
      andResult = andPermissions.every(checkPermission);
    }

    return orResult && andResult;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return checkPermissions(permissions, undefined);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return checkPermissions(undefined, permissions);
  };

  const hasExactPermissions = (
    orPermissions?: string[],
    andPermissions?: string[]
  ): boolean => {
    return checkPermissions(orPermissions, andPermissions);
  };

  return {
    hasAnyPermission,
    hasAllPermissions,
    hasExactPermissions,
    checkPermissions,
  };
}
