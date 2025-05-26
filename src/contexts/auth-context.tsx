"use client";

import React, { createContext, useContext } from "react";
import { useSession, useLogin, useLogout } from "@/hooks/use-auth";
import { useAuthFeedback } from "@/hooks/use-auth-feedback";
import type { SafeUser } from "@/types/auth";
import type { UserRole } from "@prisma/client/wasm";

type AuthContextType = {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isLoading, error, refetch } = useSession();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const {
    showLoginSuccess,
    showLogoutSuccess,
    showAuthError,
    showRoleBasedWelcome,
    showLoadingFeedback,
  } = useAuthFeedback();

  const user = sessionData?.user || null;
  const isAuthenticated = sessionData?.isAuthenticated || false;

  const login = async (email: string, password: string) => {
    try {
      const loadingToast = showLoadingFeedback("Se conectează...");

      const result = await loginMutation.mutateAsync({ email, password });

      loadingToast.dismiss();

      if (result.user) {
        showLoginSuccess(result.user);
        showRoleBasedWelcome(result.user);
      }

      // Refetch session data
      await refetch();

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      showAuthError(errorMessage, "Eroare la conectare");
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const loadingToast = showLoadingFeedback("Se deconectează...");

      await logoutMutation.mutateAsync();

      loadingToast.dismiss();
      showLogoutSuccess();
    } catch (error) {
      showAuthError(
        error instanceof Error ? error.message : "Logout failed",
        "Eroare la deconectare"
      );
    }
  };

  const refreshUser = async () => {
    await refetch();
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const clearError = () => {
    // Error clearing is handled by React Query automatically
    // This function is kept for compatibility
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error: error?.message || null,
    login,
    logout,
    refreshUser,
    hasRole,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, hasRole, user } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Required role: {requiredRole}, Your role: {user?.role}
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
