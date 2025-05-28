import type {
  User as PrismaUser,
  Administrator,
  Owner,
  Apartment,
  Building,
  Role,
} from "@prisma/client";
import { PermissionString } from "@/lib/constants";

// Permission type for JWT
export type Permission = {
  id: string;
  resource: string;
  action: string;
  scope: string | null;
};

// Extended user type with relations for API responses
export type User = PrismaUser & {
  role: Role;
  administrator?: Administrator | null;
  owner?:
    | (Owner & {
        apartments: (Apartment & {
          building: Pick<Building, "id" | "name" | "readingDeadline">;
        })[];
      })
    | null;
};

// Authentication response types
export type AuthResponse = {
  message: string;
  user?: User;
  error?: string;
  details?: string[];
};

export type AuthSuccess = {
  message: string;
  user: User;
};

export type AuthError = {
  message: string;
  error: string;
  details?: string[];
};

// Request types
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
};

// JWT types - removed role field, only permissions
export type JWTPayload = {
  userId: string;
  email: string;
  permissions: PermissionString[]; // Array of permission strings like "buildings:read:all"
  administratorId?: string;
  ownerId?: string;
  sessionId?: string;
  fingerprint?: string;
};

// Session types
export type Session = {
  user: SafeUser;
  token: string;
  expiresAt: Date;
};

// Enhanced session types for security
export type SessionFingerprint = {
  userAgent: string;
  ipAddress: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
};

export type RefreshTokenPayload = {
  userId: string;
  sessionId: string;
  fingerprint: string;
  iat?: number; // Issued at timestamp
};

export type SessionInfo = {
  id: string;
  userId: string;
  fingerprint: SessionFingerprint;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  ipAddress: string;
  userAgent: string;
};

// Safe user type - completely removed role dependency
export type SafeUser = Omit<
  User,
  "password" | "updatedAt" | "role" | "roleId"
> & {
  permissions?: PermissionString[]; // Add permissions for client-side checks
  ownerId?: string | null; // Add ownerId for backward compatibility
};

export type UserWithoutPassword = Omit<PrismaUser, "password">;

// Authentication state types
export type AuthState = {
  isAuthenticated: boolean;
  user: SafeUser | null;
  isLoading: boolean;
  error?: string | null;
};
