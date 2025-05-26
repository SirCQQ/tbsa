import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SafeUser,
} from "../types";

/**
 * Client-side authentication utilities
 */
export class AuthClient {
  private static baseUrl = "/api/auth";
  private static isRefreshing = false;
  private static refreshPromise: Promise<boolean> | null = null;

  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Include cookies
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      return result;
    } catch (error) {
      console.error({ error });
      return {
        message: "",
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }

  /**
   * Login user with enhanced session management
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Include cookies
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      return result;
    } catch (error) {
      console.error({ error });
      return {
        message: "",
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  /**
   * Logout user and clear all tokens
   */
  static async logout(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Logout failed");
      }

      return result;
    } catch (error) {
      console.error({ error });
      return {
        message: "",
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<{
    user: SafeUser | null;
    error?: string;
  }> {
    try {
      const response = await this.fetchWithAuth(`${this.baseUrl}/me`);

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the request
            const retryResponse = await this.fetchWithAuth(
              `${this.baseUrl}/me`
            );
            if (retryResponse.ok) {
              const result = await retryResponse.json();
              return { user: result.user };
            }
          }
        }
        throw new Error("Failed to get user information");
      }

      const result = await response.json();
      return { user: result.user };
    } catch (error) {
      console.error({ error });
      return {
        user: null,
        error: error instanceof Error ? error.message : "Failed to get user",
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private static async performTokenRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.warn("Token refresh failed:", response.status);
        return false;
      }

      const _result = await response.json();
      console.info("Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }

  /**
   * Fetch with automatic token refresh on 401
   */
  static async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
    });

    // If we get a 401, try to refresh the token and retry once
    if (response.status === 401 && !this.isRefreshing) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the original request
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      }
    }

    return response;
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { user } = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(role: "ADMINISTRATOR" | "OWNER"): Promise<boolean> {
    try {
      const { user } = await this.getCurrentUser();
      return user?.role === role;
    } catch {
      return false;
    }
  }

  /**
   * Make authenticated API request with automatic retry
   */
  static async apiRequest<T = unknown>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string }> {
    try {
      const response = await this.fetchWithAuth(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Request failed: ${response.status}`
        );
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("API request error:", error);
      return {
        error: error instanceof Error ? error.message : "Request failed",
      };
    }
  }
}

// React hooks for authentication (optional, for future use)
export function useAuth() {
  // This would typically use React Context or a state management library
  // For now, returning the AuthClient methods
  return {
    login: AuthClient.login,
    register: AuthClient.register,
    logout: AuthClient.logout,
    getCurrentUser: AuthClient.getCurrentUser,
    isAuthenticated: AuthClient.isAuthenticated,
    hasRole: AuthClient.hasRole,
  };
}
