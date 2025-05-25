"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthClient } from "@/lib/auth-client";
import { useAuthFeedback } from "@/hooks/use-auth-feedback";
import type { SafeUser } from "@/types/auth";

type AuthState = {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: "ADMINISTRATOR" | "OWNER") => boolean;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const {
    showLoginSuccess,
    showLogoutSuccess,
    showAuthError,
    showRoleBasedWelcome,
    showSessionExpired,
    showLoadingFeedback,
  } = useAuthFeedback();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { user, error } = await AuthClient.getCurrentUser();

      if (error && error.includes("expired")) {
        showSessionExpired();
      }

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: user !== null,
        isLoading: false,
        error: error || null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load user",
      }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const loadingToast = showLoadingFeedback("Se conectează...");

      const result = await AuthClient.login({ email, password });

      loadingToast.dismiss();

      if (result.error) {
        showAuthError(result.error, "Eroare la conectare");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || "Login failed",
        }));
        return { success: false, error: result.error };
      }

      // Reload user data after successful login
      await loadUser();

      // Show success feedback
      if (state.user) {
        showLoginSuccess(state.user);
        showRoleBasedWelcome(state.user);
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      showAuthError(errorMessage, "Eroare la conectare");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const loadingToast = showLoadingFeedback("Se deconectează...");

      await AuthClient.logout();

      loadingToast.dismiss();
      showLogoutSuccess();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      showAuthError(
        error instanceof Error ? error.message : "Logout failed",
        "Eroare la deconectare"
      );
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      });
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const hasRole = (role: "ADMINISTRATOR" | "OWNER"): boolean => {
    return state.user?.role === role;
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...state,
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
  requiredRole?: "ADMINISTRATOR" | "OWNER"
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
