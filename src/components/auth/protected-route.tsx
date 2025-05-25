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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Required role:</span>{" "}
                {requiredRole}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Your role:</span> {user?.role}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go Back
            </button>
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
