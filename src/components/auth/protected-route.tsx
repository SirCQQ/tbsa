"use client";

import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackUrl?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackUrl = "/login",
  loadingComponent,
  unauthorizedComponent,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackUrl);
    }
  }, [isAuthenticated, isLoading, router, fallbackUrl]);

  // Show loading state
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      unauthorizedComponent || (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Acces Restricționat
              </h1>
              <p className="text-muted-foreground mb-4">
                Nu aveți permisiunea de a accesa această pagină.
              </p>
              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground">
                  <strong>Rolul dvs.:</strong> {user?.role || "Necunoscut"}
                </p>
                <p className="text-sm text-foreground">
                  <strong>Roluri necesare:</strong> {requiredRole}
                </p>
              </div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Înapoi
              </button>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRole">) {
  return (
    <ProtectedRoute requiredRole="ADMINISTRATOR" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function OwnerRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRole">) {
  return (
    <ProtectedRoute requiredRole="OWNER" {...props}>
      {children}
    </ProtectedRoute>
  );
}
