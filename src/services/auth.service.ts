import { SignJWT, jwtVerify } from "jose";
import { PasswordService } from "./password.service";
import { createServiceError } from "../lib/auth-errors";
import { prisma } from "../lib/prisma";
import { LoginSchema, RegisterSchema } from "@/schemas/user";
import { ApiResponse, AuthErrorKey } from "../types/api";
import {
  JWTPayload,
  LoginRequest,
  RegisterRequest,
  SafeUser,
  SessionFingerprint,
} from "../types/auth";
import { SessionService } from "./session.service";
import { api } from "@/lib/axios";
import type { User } from "@prisma/client/wasm";

// Create secret key for JWT (keeping for backward compatibility)
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type AuthResponse = {
  user: User;
  message?: string;
};

export type SessionResponse = {
  user: SafeUser | null;
  isAuthenticated: boolean;
};

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export type ResetPasswordData = {
  token: string;
  newPassword: string;
};

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  // Logout user
  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/auth/logout");
    return response.data;
  },

  // Get current session - using /me endpoint
  async getSession(): Promise<SessionResponse> {
    try {
      const response = await api.get<SafeUser>("/auth/me");
      return {
        user: response.data,
        isAuthenticated: true,
      };
    } catch (_error) {
      // If /me fails, user is not authenticated
      return {
        user: null,
        isAuthenticated: false,
      };
    }
  },

  // Refresh session token
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/refresh");
    return response.data;
  },

  // Get current user profile - same as getSession but returns user directly
  async getProfile(): Promise<SafeUser> {
    const response = await api.get<SafeUser>("/auth/me");
    return response.data;
  },

  // Update user profile
  async updateProfile(data: Partial<SafeUser>): Promise<SafeUser> {
    const response = await api.patch<SafeUser>("/auth/profile", data);
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/auth/change-password",
      data
    );
    return response.data;
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  // Reset password with token
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },
};

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<ApiResponse<SafeUser>> {
    try {
      // Validate input data
      const validationResult = RegisterSchema.safeParse(data);
      if (!validationResult.success) {
        return createServiceError(
          AuthErrorKey.VALIDATION_FAILED,
          "Invalid input data",
          validationResult.error.errors
        );
      }

      const { firstName, lastName, email, password, phone, role } =
        validationResult.data;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return createServiceError(
          AuthErrorKey.VALIDATION_FAILED,
          "User with this email already exists"
        );
      }

      // Hash password
      const hashedPassword = await PasswordService.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
          role,
        },
        include: {
          administrator: true,
          owner: {
            include: {
              apartments: {
                include: {
                  building: {
                    select: {
                      id: true,
                      name: true,
                      readingDeadline: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Create role-specific records
      if (role === "ADMINISTRATOR") {
        await prisma.administrator.create({
          data: {
            userId: user.id,
          },
        });
      } else if (role === "OWNER") {
        await prisma.owner.create({
          data: {
            userId: user.id,
          },
        });
      }

      // Prepare safe user data
      const safeUser: SafeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        administrator: user.administrator,
        owner: user.owner,
        ownerId: null,
      };

      return {
        success: true,
        message: "User registered successfully",
        data: safeUser,
      };
    } catch (error) {
      console.error("Registration error:", error);

      return createServiceError(AuthErrorKey.INTERNAL_ERROR);
    }
  }

  /**
   * Login user with enhanced session management
   */
  static async login(
    data: LoginRequest,
    fingerprint?: SessionFingerprint
  ): Promise<
    ApiResponse<{ user: SafeUser; token: string; refreshToken?: string }>
  > {
    try {
      // Validate input data
      const validationResult = LoginSchema.safeParse(data);
      if (!validationResult.success) {
        return createServiceError(
          AuthErrorKey.VALIDATION_FAILED,
          "Invalid input data",
          validationResult.error.errors
        );
      }

      const { email, password } = validationResult.data;

      // Find user with relations
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          administrator: true,
          owner: {
            include: {
              apartments: {
                include: {
                  building: {
                    select: {
                      id: true,
                      name: true,
                      readingDeadline: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return createServiceError(AuthErrorKey.INVALID_CREDENTIALS);
      }

      // Verify password
      const isPasswordValid = await PasswordService.verifyPassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return createServiceError(AuthErrorKey.INVALID_CREDENTIALS);
      }

      // Prepare safe user data
      const safeUser: SafeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        administrator: user.administrator,
        owner: user.owner,
        ownerId: user.owner?.id || null,
      };

      // If fingerprint is provided, use enhanced session management
      if (fingerprint) {
        const sessionResult = await SessionService.createSession(
          user.id,
          fingerprint
        );

        if (!sessionResult.success || !sessionResult.data) {
          return createServiceError(AuthErrorKey.INTERNAL_ERROR);
        }

        // Update the access token with user data
        const payload: JWTPayload = {
          userId: user.id,
          email: user.email,
          role: user.role,
          administratorId: user.administrator?.id,
          ownerId: user.owner?.id,
          sessionId: sessionResult.data.sessionId,
          fingerprint: await SessionService.createFingerprint(fingerprint),
        };

        const enhancedToken = await SessionService.createEnhancedToken(
          payload,
          fingerprint
        );

        return {
          success: true,
          message: "Login successful",
          data: {
            user: safeUser,
            token: enhancedToken,
            refreshToken: sessionResult.data.refreshToken,
          },
        };
      }

      // Fallback to legacy token creation for backward compatibility
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        administratorId: user.administrator?.id,
        ownerId: user.owner?.id,
      };

      const token = await this.createToken(payload);

      return {
        success: true,
        message: "Login successful",
        data: {
          user: safeUser,
          token,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return createServiceError(AuthErrorKey.INTERNAL_ERROR);
    }
  }

  /**
   * Get current user from JWT token with full profile data
   */
  static async getCurrentUser(token: string): Promise<ApiResponse<SafeUser>> {
    try {
      // Verify JWT token
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.userId as string;

      // Fetch fresh user data with all relations
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          administrator: true,
          owner: {
            include: {
              apartments: {
                include: {
                  building: {
                    select: {
                      id: true,
                      name: true,
                      readingDeadline: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return createServiceError(
          AuthErrorKey.USER_NOT_FOUND,
          "User not found"
        );
      }

      // Prepare user data for response (exclude password)
      const userData: SafeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        administrator: user.administrator,
        owner: user.owner,
        ownerId: user.owner?.id || null,
      };

      return {
        success: true,
        data: userData,
        message: "User retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return createServiceError(
        AuthErrorKey.INVALID_TOKEN,
        "Invalid or expired token"
      );
    }
  }

  /**
   * Create JWT token (legacy method for backward compatibility)
   */
  static async createToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);
  }
}
