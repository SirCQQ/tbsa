import { faker } from "@faker-js/faker";

// Mock session type based on Prisma schema
type MockSession = {
  id: string;
  userId: string;
  token: string;
  fingerprint: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type MockSessionWithUser = MockSession & {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: "ADMINISTRATOR" | "OWNER";
    createdAt: Date;
    administrator: {
      id: string;
      userId: string;
    } | null;
    owner: {
      id: string;
      userId: string;
      apartments: unknown[];
    } | null;
  };
};

// Mock session data factories
export const createMockSession = (
  overrides?: Partial<MockSession>
): MockSession => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  token: faker.string.alphanumeric(64),
  fingerprint: faker.string.alphanumeric(32),
  expiresAt: faker.date.future(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockExpiredSession = (): MockSession => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  token: faker.string.alphanumeric(64),
  fingerprint: faker.string.alphanumeric(32),
  expiresAt: faker.date.past(), // Expired
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const createMockSessionFingerprint = () => ({
  userAgent: faker.internet.userAgent(),
  ip: faker.internet.ip(),
  acceptLanguage: "en-US,en;q=0.9",
  acceptEncoding: "gzip, deflate, br",
});

// Mock session with user data
export const createMockSessionWithUser = (
  role: "ADMINISTRATOR" | "OWNER" = "OWNER"
): MockSessionWithUser => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  token: faker.string.alphanumeric(64),
  fingerprint: faker.string.alphanumeric(32),
  expiresAt: faker.date.future(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  user: {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    role,
    createdAt: faker.date.past(),
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
  },
});

// Mock multiple sessions for cleanup testing
export const createMockMultipleSessions = (
  userId: string,
  count: number = 3
): MockSession[] => {
  return Array.from({ length: count }, () => createMockSession({ userId }));
};

// Mock session validation results
export const createMockValidSessionResult = () => ({
  isValid: true,
  session: createMockSessionWithUser(),
  user: createMockSessionWithUser().user,
});

export const createMockInvalidSessionResult = () => ({
  isValid: false,
  session: null,
  user: null,
  reason: "Session expired",
});

// Mock session creation response
export const createMockSessionCreateResponse = () => ({
  success: true,
  message: "Session created successfully",
  data: {
    accessToken: faker.string.alphanumeric(128),
    refreshToken: faker.string.alphanumeric(128),
    sessionId: faker.string.uuid(),
  },
});

// Mock session cleanup response
export const createMockSessionCleanupResponse = (deletedCount: number = 5) => ({
  success: true,
  message: `Cleaned up ${deletedCount} expired sessions`,
  data: { deletedCount },
});

// Mock user sessions list
export const createMockUserSessionsList = (count: number = 3) => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    fingerprint: faker.string.alphanumeric(32),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    expiresAt: faker.date.future(),
  }));
};

// Mock session invalidation response
export const createMockSessionInvalidationResponse = () => ({
  success: true,
  message: "Session invalidated successfully",
  data: undefined,
});
