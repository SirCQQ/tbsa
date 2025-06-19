import { faker } from "@faker-js/faker";
import type {
  SafeUser,
  LoginRequest,
  RegisterRequest,
  JWTPayload,
} from "../../../src/types/auth";
import type { ApiResponse } from "../../../src/types/api";

// Mock user data factories
export const createMockSafeUser = (): SafeUser => ({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  createdAt: faker.date.past(),
  administrator: null,
  owner: null,
  ownerId: null,
});

export const createMockLoginRequest = (): LoginRequest => ({
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
});

export const createMockRegisterRequest = (): RegisterRequest => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
  confirmPassword: faker.internet.password({ length: 12 }),
  phone: faker.phone.number(),
});

export const createMockJWTPayload = (
  role: "ADMINISTRATOR" | "OWNER" = "OWNER"
): JWTPayload => ({
  userId: faker.string.uuid(),
  email: faker.internet.email(),
  permissions:
    role === "ADMINISTRATOR" ? ["buildings:read"] : ["apartments:read"],
  administratorId: role === "ADMINISTRATOR" ? faker.string.uuid() : undefined,
  ownerId: role === "OWNER" ? faker.string.uuid() : undefined,
});

// Mock Prisma user data
export const createMockPrismaUser = (
  role: "ADMINISTRATOR" | "OWNER" = "OWNER"
) => ({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password({ length: 60 }), // bcrypt hash length
  phone: faker.phone.number(),
  role,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  administrator:
    role === "ADMINISTRATOR"
      ? {
          id: faker.string.uuid(),
          userId: faker.string.uuid(),
        }
      : null,
  owner:
    role === "OWNER"
      ? {
          id: faker.string.uuid(),
          userId: faker.string.uuid(),
          apartments: [],
        }
      : null,
});

// Mock API responses
export const createMockSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  message: "Operation successful",
});

export const createMockErrorResponse = (
  error: string,
  code: string
): ApiResponse<never> => ({
  success: false,
  error,
  code,
  message: "Operation failed",
});

// Mock session fingerprint
export const createMockSessionFingerprint = () => ({
  userAgent: faker.internet.userAgent(),
  ipAddress: faker.internet.ip(),
  acceptLanguage: "en-US,en;q=0.9",
  acceptEncoding: "gzip, deflate, br",
});

// Mock validation errors
export const createMockValidationError = () => ({
  errors: [
    {
      code: "invalid_type",
      expected: "string",
      received: "undefined",
      path: ["email"],
      message: "Required",
    },
  ],
});
