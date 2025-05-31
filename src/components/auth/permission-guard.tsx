"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PermissionString } from "@/lib/constants";

interface PermissionGuardProps {
  permissions: PermissionString[];
  requireAll?: boolean; // true = AND logic, false = OR logic (default: false)
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
  requireAuth?: boolean;
  withRedirect?: boolean;
  redirectTo?: string;
}

export function PermissionGuard({
  permissions,
  requireAll = false,
  children,
  fallback = null,
  showLoading = false,
  requireAuth = true,
  withRedirect = false,
  redirectTo = "/dashboard",
}: PermissionGuardProps) {
  const {
    isAuthenticated,
    isLoading: authLoading,
    hasPermission,
    hasAnyPermission,
    user,
  } = useAuth();
  const router = useRouter();

  // Dacă requireAuth este true și utilizatorul nu este autentificat
  if (requireAuth && !isAuthenticated && !authLoading) {
    if (withRedirect) {
      router.push("/auth/login");
      return null;
    }
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

  // Dacă nu sunt permisiuni specificate, permite accesul
  if (!permissions || permissions.length === 0) {
    return <>{children}</>;
  }

  // Verifică permisiunile
  let hasRequiredPermissions = false;

  if (requireAll) {
    // AND logic - toate permisiunile trebuie să fie prezente
    hasRequiredPermissions = permissions.every((perm) => hasPermission(perm));
  } else {
    // OR logic - cel puțin o permisiune trebuie să fie prezentă
    hasRequiredPermissions = hasAnyPermission(permissions);
  }

  if (!hasRequiredPermissions) {
    if (withRedirect) {
      router.push(redirectTo);
      return null;
    }
    return <>{fallback}</>;
  }
  console.log(permissions, user?.permissions);

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
