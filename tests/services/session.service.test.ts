// Import existing mocks
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma.mock";
import { mockJose, resetJoseMocks } from "../__mocks__/jose.mock";

// Mock jose module using existing mock
jest.mock("jose", () => mockJose);

import { SessionService } from "../../src/services/session.service";
import {
  createMockUser,
  createMockAdministrator,
} from "../__mocks__/data.mock";
import { SessionFingerprint } from "../../src/types/auth";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock console methods to prevent pollution during error tests
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockConsoleWarn = jest
  .spyOn(console, "warn")
  .mockImplementation(() => {});

// Mock Web Crypto API
const mockCrypto = {
  subtle: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    digest: jest.fn().mockResolvedValue(new ArrayBuffer(32) as never),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRandomValues: jest.fn().mockImplementation((array: any) => {
    // Fill array with mock random values
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
};

// Mock global crypto
Object.defineProperty(global, "crypto", {
  value: mockCrypto,
  writable: true,
});

// Mock TextEncoder
Object.defineProperty(global, "TextEncoder", {
  value: class MockTextEncoder {
    encode(input: string): Uint8Array {
      return new Uint8Array(Buffer.from(input, "utf8"));
    }
  },
  writable: true,
});

describe("SessionService", () => {
  const mockFingerprint: SessionFingerprint = {
    userAgent: "Mozilla/5.0 Test Browser",
    ipAddress: "192.168.1.1",
    acceptLanguage: "en-US,en;q=0.9",
    acceptEncoding: "gzip, deflate, br",
  };

  const mockUser = createMockUser();

  beforeEach(() => {
    jest.clearAllMocks();
    resetPrismaMocks();
    resetJoseMocks();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();

    // Reset crypto mocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCrypto.subtle.digest.mockResolvedValue(new ArrayBuffer(32) as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCrypto.getRandomValues.mockImplementation((array: any) => {
      // Fill array with mock random values
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    });
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  describe("createFingerprint", () => {
    it("should create a fingerprint hash from headers", async () => {
      const mockHashBuffer = new ArrayBuffer(32);
      const mockHashArray = new Uint8Array(mockHashBuffer);
      mockHashArray.fill(255); // Fill with 0xFF for predictable output

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer as never);

      const result = await SessionService.createFingerprint(mockFingerprint);

      expect(result).toBe("ff".repeat(32)); // 32 bytes of 0xFF
      expect(mockCrypto.subtle.digest).toHaveBeenCalledWith(
        "SHA-256",
        expect.any(Uint8Array)
      );
    });

    it("should handle empty headers", async () => {
      const mockHashBuffer = new ArrayBuffer(32);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer as never);

      const result = await SessionService.createFingerprint({});

      expect(typeof result).toBe("string");
      expect(result.length).toBe(64); // 32 bytes * 2 hex chars
    });

    it("should create consistent fingerprints for same input", async () => {
      const mockHashBuffer = new ArrayBuffer(32);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer as never);

      const result1 = await SessionService.createFingerprint(mockFingerprint);
      const result2 = await SessionService.createFingerprint(mockFingerprint);

      expect(result1).toBe(result2);
    });
  });

  describe("generateRandomBytes", () => {
    it("should generate random bytes of specified length", () => {
      const length = 16;
      const result = SessionService.generateRandomBytes(length);

      expect(typeof result).toBe("string");
      expect(result.length).toBe(length * 2); // Each byte becomes 2 hex chars
      expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(
        expect.any(Uint8Array)
      );
    });

    it("should generate different values on subsequent calls", () => {
      const result1 = SessionService.generateRandomBytes(16);
      const result2 = SessionService.generateRandomBytes(16);

      expect(result1).not.toBe(result2);
    });
  });

  describe("createSession", () => {
    it("should return error when user not found", async () => {
      const mockSession = {
        id: "session-123",
        userId: mockUser.id,
        token: "session-123",
        fingerprint: "fingerprint-hash",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockPrisma.session.create.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await SessionService.createSession(
        mockUser.id,
        mockFingerprint
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("AUTH_006");
      expect(result.error).toBe("User not found");
    });

    it("should handle database errors during user lookup", async () => {
      const mockSession = {
        id: "session-123",
        userId: mockUser.id,
        token: "session-123",
        fingerprint: "fingerprint-hash",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockPrisma.session.create.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      const result = await SessionService.createSession(
        mockUser.id,
        mockFingerprint
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("AUTH_010");
    });
  });

  describe("invalidateSession", () => {
    it("should invalidate session successfully", async () => {
      mockPrisma.session.delete.mockResolvedValue({
        id: "session-123",
        userId: mockUser.id,
      });

      const result = await SessionService.invalidateSession("session-123");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Session invalidated successfully");
      expect(result.data).toBeUndefined();
      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { id: "session-123" },
      });
    });
  });

  describe("invalidateAllUserSessions", () => {
    it("should invalidate all user sessions successfully", async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 3 });

      const result = await SessionService.invalidateAllUserSessions(
        mockUser.id
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("All user sessions invalidated successfully");
      expect(result.data).toBeUndefined();
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });
  });

  describe("cleanupExpiredSessions", () => {
    it("should cleanup expired sessions successfully", async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 5 });

      const result = await SessionService.cleanupExpiredSessions();

      expect(result.success).toBe(true);
      expect(result.message).toBe("Cleaned up 5 expired sessions");
      expect(result.data).toEqual({ deletedCount: 5 });
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });

  describe("getUserSessions", () => {
    const mockSessions = [
      {
        id: "session-1",
        fingerprint: "fingerprint-1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "session-2",
        fingerprint: "fingerprint-2",
        createdAt: new Date("2024-01-03"),
        updatedAt: new Date("2024-01-04"),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ];

    it("should get user sessions successfully", async () => {
      mockPrisma.session.findMany.mockResolvedValue(mockSessions);

      const result = await SessionService.getUserSessions(mockUser.id);

      expect(result.success).toBe(true);
      expect(result.message).toBe("User sessions retrieved successfully");
      expect(result.data).toEqual(mockSessions);
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          expiresAt: {
            gt: expect.any(Date),
          },
        },
        select: {
          id: true,
          fingerprint: true,
          createdAt: true,
          updatedAt: true,
          expiresAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    });
  });

  describe("validateFingerprint", () => {
    it("should validate matching fingerprints", async () => {
      const storedFingerprint = "stored-fingerprint-hash";

      // Mock createFingerprint to return the same hash
      jest
        .spyOn(SessionService, "createFingerprint")
        .mockResolvedValue(storedFingerprint);

      const result = await SessionService.validateFingerprint(
        storedFingerprint,
        mockFingerprint
      );

      expect(result).toBe(true);
    });

    it("should reject non-matching fingerprints", async () => {
      const storedFingerprint = "stored-fingerprint-hash";
      const currentFingerprint = "different-fingerprint-hash";

      // Mock createFingerprint to return different hash
      jest
        .spyOn(SessionService, "createFingerprint")
        .mockResolvedValue(currentFingerprint);

      const result = await SessionService.validateFingerprint(
        storedFingerprint,
        mockFingerprint
      );

      expect(result).toBe(false);
    });
  });
});
