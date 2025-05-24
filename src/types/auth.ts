import type {
  User as PrismaUser,
  UserRole,
  Administrator,
  Owner,
  Apartment,
  Building,
} from "@prisma/client/wasm";

// Re-export Prisma types for consistency
export type { UserRole } from "@prisma/client/wasm";

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
};

// Session types
export type Session = {
  user: SafeUser;
  token: string;
  expiresAt: Date;
};

// Utility types
export type SafeUser = Omit<User, "password" | "updatedAt">;
export type UserWithoutPassword = Omit<PrismaUser, "password">;

// Authentication state types
export type AuthState = {
  isAuthenticated: boolean;
  user: SafeUser | null;
  isLoading: boolean;
};
