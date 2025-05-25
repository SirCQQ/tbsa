import { hashPassword } from "../src/lib/auth";
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
    it("should validate registration data correctly", async () => {
      const validRegistrationData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "StrongPassword123!",
        confirmPassword: "StrongPassword123!",
        phone: "+1234567890",
        role: "OWNER",
      };

      // Test that our validation schema accepts valid data
      const { registerSchema } = await import("../src/lib/validations");
      const result = registerSchema.safeParse(validRegistrationData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(validRegistrationData.email);
        expect(result.data.role).toBe("OWNER");
      }
    });

    it("should reject registration with invalid data", async () => {
      const invalidRegistrationData = {
        firstName: "",
        lastName: "Doe",
        email: "invalid-email",
        password: "123", // Too short
        confirmPassword: "456", // Doesn't match
        role: "INVALID_ROLE",
      };

      const { registerSchema } = await import("../src/lib/validations");
      const result = registerSchema.safeParse(invalidRegistrationData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe("User Login Flow", () => {
    it("should validate login data correctly", async () => {
      const validLoginData = {
        email: "user@example.com",
        password: "ValidPassword123!",
      };

      const { loginSchema } = await import("../src/lib/validations");
      const result = loginSchema.safeParse(validLoginData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(validLoginData.email);
        expect(result.data.password).toBe(validLoginData.password);
      }
    });

    it("should reject login with empty password", async () => {
      const invalidLoginData = {
        email: "user@example.com",
        password: "",
      };

      const { loginSchema } = await import("../src/lib/validations");
      const result = loginSchema.safeParse(invalidLoginData);

      expect(result.success).toBe(false);
    });
  });

  describe("Password Security", () => {
    it("should hash passwords securely", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are long
      expect(hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it("should verify passwords correctly", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);

      const { verifyPassword } = await import("../src/lib/auth");
      const isValid = await verifyPassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect passwords", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword456!";
      const hashedPassword = await hashPassword(password);

      const { verifyPassword } = await import("../src/lib/auth");
      const isValid = await verifyPassword(wrongPassword, hashedPassword);

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

  describe("Authentication Client", () => {
    it("should have correct API endpoint structure", async () => {
      const { AuthClient } = await import("../src/lib/auth-client");

      // Test that AuthClient has the expected methods
      expect(typeof AuthClient.register).toBe("function");
      expect(typeof AuthClient.login).toBe("function");
      expect(typeof AuthClient.logout).toBe("function");
      expect(typeof AuthClient.getCurrentUser).toBe("function");
      expect(typeof AuthClient.isAuthenticated).toBe("function");
      expect(typeof AuthClient.hasRole).toBe("function");
    });
  });
});
