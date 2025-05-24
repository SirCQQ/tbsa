import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types";

// Client-side authentication functions
export class AuthClient {
  private static baseUrl = "/api/auth";

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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

  static async getCurrentUser(): Promise<{
    user: User | null;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        return { user: null };
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to get user");
      }

      return { user: result.user };
    } catch (error) {
      console.error({ error });
      return {
        user: null,
        error: error instanceof Error ? error.message : "Failed to get user",
      };
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const { user } = await this.getCurrentUser();
    return user !== null;
  }

  static async hasRole(role: "ADMINISTRATOR" | "OWNER"): Promise<boolean> {
    const { user } = await this.getCurrentUser();
    return user?.role === role;
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
