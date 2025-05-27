import type {
  User as PrismaUser,
  UserRole,
  Administrator,
  Owner,
  Apartment,
  Building,
} from "@prisma/client";

// Re-export Prisma types for consistency
export type { UserRole } from "@prisma/client";

// Extended user type with relations for API responses
export type User = PrismaUser & {
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
  role: UserRole;
};

// JWT types
export type JWTPayload = {
  userId: string;
  email: string;
  role: UserRole;
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

// Utility types
export type SafeUser = Omit<User, "password" | "updatedAt">;
export type UserWithoutPassword = Omit<PrismaUser, "password">;

// Authentication state types
export type AuthState = {
  isAuthenticated: boolean;
  user: SafeUser | null;
  isLoading: boolean;
  error?: string | null;
};
