import type {
  User as PrismaUser,
  Role,
  UserRole,
  Permission,
} from "@prisma/client/wasm";
import type { PermissionString } from "@/lib/constants";

// Permission type for JWT
export type JWTPayload = {
  userId: string;
  email: string;
  permissions: PermissionString[];
  administratorId?: string;
  ownerId?: string;
  sessionId?: string;
  fingerprint?: string;
  iat: number;
  exp: number;
};

// Login request type
export type LoginRequest = {
  email: string;
  password: string;
};

// Register request type
export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
};

// Extended user type with relations for API responses
export type User = PrismaUser & {
  organizations: {
    organization: {
      id: string;
      name: string;
      code: string;
    };
  }[];
  roles: (UserRole & {
    role: Role & {
      permissions: Permission[];
    };
  })[];
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

// Safe user type for client-side
export type SafeUser = Omit<PrismaUser, "password"> & {
  permissions: PermissionString[];
  currentOrganization?: {
    id: string;
    name: string;
    code: string;
  } | null;
};

export type UserWithoutPassword = Omit<User, "password">;

// Authentication state types
export type AuthState = {
  isAuthenticated: boolean;
  user: SafeUser | null;
  isLoading: boolean;
  error?: string | null;
};
