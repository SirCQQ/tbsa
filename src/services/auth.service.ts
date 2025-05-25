import { SignJWT, jwtVerify } from "jose";
import { hashPassword, verifyPassword } from "../lib/auth";
import { createServiceError } from "../lib/auth-errors";
import { prisma } from "../lib/prisma";
import { loginSchema, registerSchema } from "../lib/validations";
import { ApiResponse, AuthErrorKey } from "../types/api";
import {
  JWTPayload,
  LoginRequest,
  RegisterRequest,
  SafeUser,
} from "../types/auth";

// Create secret key for JWT
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<ApiResponse<SafeUser>> {
    try {
      // Validate input data
      const validationResult = registerSchema.safeParse(data);
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
      const hashedPassword = await hashPassword(password);

      // Create user with transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            role,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
          },
        });

        // Create role-specific record
        if (role === "ADMINISTRATOR") {
          await tx.administrator.create({
            data: { userId: user.id },
          });
        } else if (role === "OWNER") {
          await tx.owner.create({
            data: { userId: user.id },
          });
        }

        return user;
      });

      return {
        success: true,
        message: "User registered successfully",
        data: result as SafeUser,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return createServiceError(AuthErrorKey.INTERNAL_ERROR);
    }
  }

  /**
   * Login user with email and password
   */
  static async login(
    data: LoginRequest
  ): Promise<ApiResponse<{ user: SafeUser; token: string }>> {
    try {
      // Validate input data
      const validationResult = loginSchema.safeParse(data);
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
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return createServiceError(AuthErrorKey.INVALID_CREDENTIALS);
      }

      // Create JWT token
      const token = await this.createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        administratorId: user.administrator?.id,
        ownerId: user.owner?.id,
      });

      // Prepare safe user data (exclude password)
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
      };

      return {
        success: true,
        message: "Login successful",
        data: { user: safeUser, token },
      };
    } catch (error) {
      console.error("Login error:", error);
      return createServiceError(AuthErrorKey.INTERNAL_ERROR);
    }
  }

  /**
   * Get user by JWT token
   */
  static async getUserFromToken(token: string): Promise<ApiResponse<SafeUser>> {
    try {
      // Verify JWT token
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.userId as string;

      // Fetch fresh user data
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
        return createServiceError(AuthErrorKey.USER_NOT_FOUND);
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
      };

      return {
        success: true,
        message: "User retrieved successfully",
        data: safeUser,
      };
    } catch (error) {
      console.error("Token verification error:", error);
      return createServiceError(AuthErrorKey.INVALID_TOKEN);
    }
  }

  /**
   * Create JWT token
   */
  static async createToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, secret);
      return payload as JWTPayload;
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  }
}
