// Import existing mocks
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma.mock";
import { mockJose, resetJoseMocks } from "../__mocks__/jose.mock";

// Mock jose module using existing mock
jest.mock("jose", () => mockJose);

import { AuthService } from "../../src/services/auth.service";
import { PasswordService } from "../../src/services/password.service";
import { SessionService } from "../../src/services/session.service";
import {
  createMockUser,
  createMockOwner,
  createMockAdministrator,
  createMockGetCurrentUserPrismaResult,
} from "../__mocks__/data.mock";
import { RegisterRequest, LoginRequest } from "../../src/types/auth";
import { JWTPayload } from "@/types";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

let authService: AuthService;

// Mock PasswordService static methods using spyOn
const mockHashPassword = jest.spyOn(PasswordService, "hashPassword");
const mockVerifyPassword = jest.spyOn(PasswordService, "verifyPassword");

// Mock SessionService static methods using spyOn
const mockCreateSession = jest.spyOn(SessionService, "createSession");
const mockCreateFingerprint = jest.spyOn(SessionService, "createFingerprint");
const mockCreateEnhancedToken = jest.spyOn(
  SessionService,
  "createEnhancedToken"
);

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPrismaMocks();
    resetJoseMocks();

    mockHashPassword.mockClear();
    mockVerifyPassword.mockClear();
    mockCreateSession.mockClear();
    mockCreateFingerprint.mockClear();
    mockCreateEnhancedToken.mockClear();
    authService = new AuthService();
  });

  afterAll(() => {
    mockHashPassword.mockRestore();
    mockVerifyPassword.mockRestore();
    mockCreateSession.mockRestore();
    mockCreateFingerprint.mockRestore();
    mockCreateEnhancedToken.mockRestore();
  });

  describe("AuthService static methods", () => {
    it("should be defined", () => {
      expect(AuthService).toBeDefined();
    });

    describe("register", () => {
      it("should register a new user successfully", async () => {
        const mockUser = createMockUser();
        const registerData: RegisterRequest = {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          password: "password123",
          confirmPassword: "password123",
          role: "OWNER",
        };

        const mockCreatedUser = {
          ...mockUser,
          administrator: null,
          owner: createMockOwner(),
        };

        jest
          .spyOn(mockPrisma.owner, "create")
          .mockResolvedValue(createMockOwner());
        jest.spyOn(mockPrisma.user, "findUnique").mockResolvedValue(null); // User doesn't exist
        mockHashPassword.mockResolvedValue("hashedPassword");
        jest
          .spyOn(mockPrisma.user, "create")
          .mockResolvedValue(mockCreatedUser);

        const result = await AuthService.register(registerData);
        console.log({ result });
        expect(result.success).toBe(true);
        expect(result.message).toBe("User registered successfully");
        expect(result.data).toEqual({
          id: mockUser.id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          phone: mockUser.phone,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          administrator: null,
          owner: mockCreatedUser.owner,
          ownerId: null,
        });
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: {
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            email: registerData.email,
            password: "hashedPassword",
            phone: undefined,
            role: "OWNER",
          },
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
      });

      it("should register an administrator successfully", async () => {
        const mockUser = createMockUser();
        const registerData: RegisterRequest = {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          password: "password123",
          confirmPassword: "password123",
          role: "ADMINISTRATOR",
        };

        const mockCreatedUser = {
          ...mockUser,
          role: "ADMINISTRATOR" as const,
          administrator: createMockAdministrator(),
          owner: null,
        };

        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockHashPassword.mockResolvedValue("hashedPassword");
        mockPrisma.user.create.mockResolvedValue(mockCreatedUser);
        mockPrisma.administrator.create.mockResolvedValue(
          createMockAdministrator()
        );

        const result = await AuthService.register(registerData);

        expect(result.success).toBe(true);
        expect(result.data?.role).toBe("ADMINISTRATOR");
        expect(mockPrisma.administrator.create).toHaveBeenCalledWith({
          data: {
            userId: mockUser.id,
          },
        });
      });

      it("should return error when user already exists", async () => {
        const mockUser = createMockUser();
        const registerData: RegisterRequest = {
          firstName: "John",
          lastName: "Doe",
          email: mockUser.email,
          password: "password123",
          confirmPassword: "password123",
          role: "OWNER",
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser);

        const result = await AuthService.register(registerData);

        expect(result.success).toBe(false);
        expect(result.error).toBe("User with this email already exists");
        expect(mockPrisma.user.create).not.toHaveBeenCalled();
      });

      it("should return validation error for invalid data", async () => {
        const invalidData = {
          firstName: "",
          lastName: "",
          email: "invalid-email",
          password: "123", // Too short
          confirmPassword: "456", // Doesn't match
          role: "INVALID_ROLE",
        } as unknown as RegisterRequest;

        const result = await AuthService.register(invalidData);

        expect(result.success).toBe(false);
        expect(result.code).toBe("AUTH_007");
        expect(result.error).toBe("Invalid input data");
      });

      it("should handle database errors", async () => {
        const registerData: RegisterRequest = {
          firstName: "John",
          lastName: "Doe",
          email: "test@example.com",
          password: "password123",
          confirmPassword: "password123",
          role: "OWNER",
        };

        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockHashPassword.mockResolvedValue("hashedPassword");
        mockPrisma.user.create.mockRejectedValue(new Error("Database error"));

        const result = await AuthService.register(registerData);

        expect(result.success).toBe(false);
        expect(result.code).toBe("AUTH_010");
      });
    });

    describe("login", () => {
      it("should login user successfully without fingerprint", async () => {
        const mockUser = createMockUser();
        const loginData: LoginRequest = {
          email: mockUser.email,
          password: "password123",
        };

        const mockUserWithRelations = {
          ...mockUser,
          administrator: null,
          owner: createMockOwner(),
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRelations);
        mockVerifyPassword.mockResolvedValue(true);

        const result = await AuthService.login(loginData);

        expect(result.success).toBe(true);
        expect(result.message).toBe("Login successful");
        expect(result.data?.user).toEqual({
          id: mockUser.id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          phone: mockUser.phone,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          administrator: null,
          owner: mockUserWithRelations.owner,
          ownerId: mockUserWithRelations.owner.id,
        });
        expect(result.data?.token).toBeDefined();
        expect(typeof result.data?.token).toBe("string");
      });

      it("should login user successfully with fingerprint", async () => {
        const mockUser = createMockUser();
        const loginData: LoginRequest = {
          email: mockUser.email,
          password: "password123",
        };
        const fingerprint = {
          userAgent: "test-agent",
          ipAddress: "127.0.0.1",
        };

        const mockUserWithRelations = {
          ...mockUser,
          administrator: null,
          owner: createMockOwner(),
        };

        const mockSessionResult = {
          success: true,
          message: "Session created successfully",
          data: {
            accessToken: "access-token-123",
            sessionId: "session-123",
            refreshToken: "refresh-token-123",
          },
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRelations);
        mockVerifyPassword.mockResolvedValue(true);
        mockCreateSession.mockResolvedValue(mockSessionResult);
        mockCreateFingerprint.mockResolvedValue("fingerprint-hash");
        mockCreateEnhancedToken.mockResolvedValue("enhanced-token");

        const result = await AuthService.login(loginData, fingerprint);

        expect(result.success).toBe(true);
        expect(result.data?.token).toBe("enhanced-token");
        expect(result.data?.refreshToken).toBe("refresh-token-123");
        expect(mockCreateSession).toHaveBeenCalledWith(
          mockUser.id,
          fingerprint
        );
      });

      it("should return error when user not found", async () => {
        const loginData: LoginRequest = {
          email: "nonexistent@example.com",
          password: "password123",
        };

        mockPrisma.user.findUnique.mockResolvedValue(null);

        const result = await AuthService.login(loginData);

        expect(result.success).toBe(false);
        expect(result.code).toBe("AUTH_005");
        expect(result.error).toBe("Invalid email or password");
      });

      it("should return error when password is invalid", async () => {
        const mockUser = createMockUser();
        const loginData: LoginRequest = {
          email: mockUser.email,
          password: "wrongpassword",
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        mockVerifyPassword.mockResolvedValue(false);

        const result = await AuthService.login(loginData);

        expect(result.success).toBe(false);
        expect(result.code).toBe("AUTH_005");
        expect(result.error).toBe("Invalid email or password");
      });

      it("should return validation error for invalid login data", async () => {
        const invalidData = {
          email: "invalid-email",
          password: "",
        } as LoginRequest;

        const result = await AuthService.login(invalidData);

        expect(result.success).toBe(false);
        expect(result.code).toBe("AUTH_007");
        expect(result.error).toBe("Invalid input data");
      });

      it("should handle session creation failure", async () => {
        const mockUser = createMockUser();
        const loginData: LoginRequest = {
          email: mockUser.email,
          password: "password123",
        };
        const fingerprint = {
          userAgent: "test-agent",
          ipAddress: "127.0.0.1",
        };

        const mockUserWithRelations = {
          ...mockUser,
          administrator: null,
          owner: createMockOwner(),
        };

        const mockSessionResult = {
          success: false,
          message: "Session creation failed",
          data: undefined,
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRelations);
        mockVerifyPassword.mockResolvedValue(true);
        mockCreateSession.mockResolvedValue(mockSessionResult);

        const result = await AuthService.login(loginData, fingerprint);

        expect(result.success).toBe(false);
        expect(result.code).toBe("AUTH_010");
      });

      it("should handle database errors", async () => {
        const loginData: LoginRequest = {
          email: "test@example.com",
          password: "password123",
        };

        mockPrisma.user.findUnique.mockRejectedValue(
          new Error("Database error")
        );

        const result = await AuthService.login(loginData);

        expect(result.success).toBe(false);
        expect(result.code).toBe("AUTH_010");
      });
    });

    describe("getCurrentUser", () => {
      it("should return user data when token is valid", async () => {
        const mockUserWithRelations = createMockGetCurrentUserPrismaResult();

        mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRelations);

        const result = await AuthService.getCurrentUser("valid_token");

        expect(result).toEqual({
          success: true,
          data: mockUserWithRelations,
          message: "User retrieved successfully",
        });
      });

      it("should return error when token is invalid", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        const result = await AuthService.getCurrentUser("invalid_token");

        expect(result).toEqual({
          code: "AUTH_006",
          details: undefined,
          error: "User not found",
          message: "Authentication failed",
          success: false,
        });
      });

      it("should return error when user not found", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        const result = await AuthService.getCurrentUser("valid_token");

        expect(result).toEqual({
          success: false,
          code: "AUTH_006",
          details: undefined,
          error: "User not found",
          message: "Authentication failed",
        });
      });
    });
  });

  describe("createToken", () => {
    it("should create a valid JWT token", async () => {
      const payload = {
        userId: "123",
        email: "test@example.com",
      };

      const token = await AuthService.createToken(payload as JWTPayload);

      expect(typeof token).toBe("string");
      expect(token).not.toBe("");
    });

    it("should create token with all payload fields", async () => {
      const payload: JWTPayload = {
        userId: "123",
        email: "test@example.com",
        role: "OWNER",
        administratorId: undefined,
        ownerId: "owner-123",
        sessionId: "session-123",
        fingerprint: "fingerprint-hash",
      };

      const token = await AuthService.createToken(payload);

      expect(typeof token).toBe("string");
      expect(token).not.toBe("");
    });
  });
});

describe("AuthService instance methods", () => {
  it("should be initialized", () => {
    expect(authService).toBeDefined();
  });
});

// Additional edge case tests
describe("Edge cases and error handling", () => {
  describe("register edge cases", () => {
    it("should handle password hashing failure", async () => {
      const registerData: RegisterRequest = {
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "OWNER",
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockHashPassword.mockRejectedValue(new Error("Hashing failed"));

      const result = await AuthService.register(registerData);

      expect(result.success).toBe(false);
      expect(result.code).toBe("AUTH_010");
    });

    it("should handle role-specific record creation failure", async () => {
      const mockUser = createMockUser();
      const registerData: RegisterRequest = {
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        password: "password123",
        confirmPassword: "password123",
        role: "OWNER",
      };

      const mockCreatedUser = {
        ...mockUser,
        administrator: null,
        owner: createMockOwner(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue("hashedPassword");
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockPrisma.owner.create.mockRejectedValue(
        new Error("Owner creation failed")
      );

      const result = await AuthService.register(registerData);

      expect(result.success).toBe(false);
      expect(result.code).toBe("AUTH_010");
    });
  });

  describe("login edge cases", () => {
    it("should handle password verification failure", async () => {
      const mockUser = createMockUser();
      const loginData: LoginRequest = {
        email: mockUser.email,
        password: "password123",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockRejectedValue(new Error("Verification failed"));

      const result = await AuthService.login(loginData);

      expect(result.success).toBe(false);
      expect(result.code).toBe("AUTH_005");
    });

    it("should handle session service fingerprint creation failure", async () => {
      const mockUser = createMockUser();
      const loginData: LoginRequest = {
        email: mockUser.email,
        password: "password123",
      };
      const fingerprint = {
        userAgent: "test-agent",
        ipAddress: "127.0.0.1",
      };

      const mockUserWithRelations = {
        ...mockUser,
        administrator: null,
        owner: createMockOwner(),
      };

      const mockSessionResult = {
        success: true,
        message: "Session created successfully",
        data: {
          accessToken: "access-token-123",
          sessionId: "session-123",
          refreshToken: "refresh-token-123",
        },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRelations);
      mockVerifyPassword.mockResolvedValue(true);
      mockCreateSession.mockResolvedValue(mockSessionResult);
      mockCreateFingerprint.mockRejectedValue(new Error("Fingerprint failed"));

      const result = await AuthService.login(loginData, fingerprint);

      expect(result.success).toBe(false);
      expect(result.code).toBe("AUTH_005");
    });

    it("should handle enhanced token creation failure", async () => {
      const mockUser = createMockUser();
      const loginData: LoginRequest = {
        email: mockUser.email,
        password: "password123",
      };
      const fingerprint = {
        userAgent: "test-agent",
        ipAddress: "127.0.0.1",
      };

      const mockUserWithRelations = {
        ...mockUser,
        administrator: null,
        owner: createMockOwner(),
      };

      const mockSessionResult = {
        success: true,
        message: "Session created successfully",
        data: {
          accessToken: "access-token-123",
          sessionId: "session-123",
          refreshToken: "refresh-token-123",
        },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRelations);
      mockVerifyPassword.mockResolvedValue(true);
      mockCreateSession.mockResolvedValue(mockSessionResult);
      mockCreateFingerprint.mockResolvedValue("fingerprint-hash");
      mockCreateEnhancedToken.mockRejectedValue(
        new Error("Token creation failed")
      );

      const result = await AuthService.login(loginData, fingerprint);

      expect(result.success).toBe(false);
      expect(result.code).toBe("AUTH_005");
    });
  });

  describe("getCurrentUser edge cases", () => {
    it("should handle database query failure", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      const result = await AuthService.getCurrentUser("valid_token");

      expect(result.success).toBe(false);
      expect(result.code).toBe("AUTH_002");
      expect(result.error).toBe("Invalid or expired token");
    });
  });

  describe("createToken edge cases", () => {
    it("should handle token creation with minimal payload", async () => {
      const payload = {
        userId: "123",
        email: "test@example.com",
        role: "OWNER",
      } as JWTPayload;

      const token = await AuthService.createToken(payload);

      expect(typeof token).toBe("string");
      expect(token).not.toBe("");
    });
  });
});
