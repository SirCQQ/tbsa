import { PasswordService } from "../src/services/password.service";
import { TextEncoder } from "util";
// Mock jose library
jest.mock("jose", () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mocked-jwt-token"),
  })),
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      userId: "test-user-id",
      email: "test@example.com",
      role: "OWNER",
    },
  }),
}));

// Mock fetch for testing
global.fetch = jest.fn();

describe("Authentication API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Registration Flow", () => {
    it("should validate registration data with Zod", async () => {
      const { RegisterSchema } = await import("../src/schemas/user");

      const validData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "securePassword123",
        confirmPassword: "securePassword123",
        role: "OWNER" as const,
      };

      const result = RegisterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid registration data", async () => {
      const { RegisterSchema } = await import("../src/schemas/user");

      const invalidData = {
        firstName: "",
        lastName: "Doe",
        email: "invalid-email",
        password: "123",
        confirmPassword: "different",
        role: "INVALID_ROLE" as string,
      };

      const result = RegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("User Login Flow", () => {
    it("should validate login data with Zod", async () => {
      const { LoginSchema } = await import("../src/schemas/user");

      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = LoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid login data", async () => {
      const { LoginSchema } = await import("../src/schemas/user");

      const invalidData = {
        email: "invalid-email",
        password: "",
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Password Security", () => {
    it("should hash passwords securely", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await PasswordService.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are long
      expect(hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it("should verify passwords correctly", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await PasswordService.hashPassword(password);

      const isValid = await PasswordService.verifyPassword(
        password,
        hashedPassword
      );

      expect(isValid).toBe(true);
    });

    it("should reject incorrect passwords", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword456!";
      const hashedPassword = await PasswordService.hashPassword(password);

      const isValid = await PasswordService.verifyPassword(
        wrongPassword,
        hashedPassword
      );

      expect(isValid).toBe(false);
    });
  });

  describe("JWT Token Handling", () => {
    it("should create and verify JWT tokens", async () => {
      const { SignJWT, jwtVerify } = await import("jose");
      const secret = new TextEncoder().encode("test-secret-key");

      const payload = {
        userId: "test-user-id",
        email: "test@example.com",
        role: "OWNER",
      };

      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);

      expect(token).toBe("mocked-jwt-token");

      const { payload: verifiedPayload } = await jwtVerify(token, secret);
      expect(verifiedPayload.userId).toBe("test-user-id");
      expect(verifiedPayload.email).toBe("test@example.com");
      expect(verifiedPayload.role).toBe("OWNER");
    });
  });
});
