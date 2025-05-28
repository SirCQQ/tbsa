"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PermissionString } from "@/lib/constants";

interface PermissionGuardProps {
  permission: PermissionString;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
  requireAuth?: boolean;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
  showLoading = false,
  requireAuth = true,
}: PermissionGuardProps) {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    hasPermission,
  } = useAuth();

  // Dacă requireAuth este true și utilizatorul nu este autentificat
  if (requireAuth && !isAuthenticated && !authLoading) {
    return <>{fallback}</>;
  }

  // Afișează loading dacă este necesar
  if (authLoading && showLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verifică permisiunea direct din context (JWT)
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook pentru verificarea permisiunilor în componente
export function usePermission(permission: PermissionString) {
  const { hasPermission } = useAuth();

  return {
    data: { hasPermission: hasPermission(permission), permission },
    isLoading: false,
    error: null,
  };
}

// Hook pentru verificarea multiplelor permisiuni
export function usePermissions(permissions: PermissionString[]) {
  const { hasPermission } = useAuth();

  const permissionResults = permissions.reduce((acc, perm) => {
    acc[perm] = hasPermission(perm);
    return acc;
  }, {} as Record<string, boolean>);

  return {
    data: permissionResults,
    isLoading: false,
    error: null,
  };
}

// Hook pentru verificarea rapidă a permisiunilor
export function usePermissionCheck() {
  const { user, hasPermission, hasAnyPermission } = useAuth();

  return {
    user,
    hasPermission,
    hasAnyPermission,
    permissions: user?.permissions || [],
  };
}
