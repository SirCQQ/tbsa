import { mockJose, resetJoseMocks } from "../__mocks__/jose.mock";

// Mock console.error to prevent pollution during error tests
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock NextRequest to avoid Request dependency issues
jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    headers: new Map(),
  })),
}));

// Mock jose library to prevent ES module issues
jest.mock("jose", () => mockJose);

import {
  getTenantContext,
  getTenantContextFromToken,
  createBuildingFilter,
  createApartmentFilter,
  createWaterReadingFilter,
  canAccessBuilding,
  canAccessApartment,
  TenantContext,
} from "../../src/lib/tenant";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { faker } from "@faker-js/faker";

const secret = new TextEncoder().encode("test-secret-key");

// Mock data factories
const createMockAdministratorContext = (): TenantContext => ({
  userId: faker.string.uuid(),
  role: "ADMINISTRATOR",
  administratorId: faker.string.uuid(),
  email: faker.internet.email(),
});

const createMockOwnerContext = (): TenantContext => ({
  userId: faker.string.uuid(),
  role: "OWNER",
  ownerId: faker.string.uuid(),
  email: faker.internet.email(),
});

const createMockJWT = async (payload: TenantContext) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
};

describe("Tenant Utility Functions", () => {
  beforeEach(() => {
    resetJoseMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("getTenantContext", () => {
    it("should extract tenant context from request headers for administrator", () => {
      const mockContext = createMockAdministratorContext();
      const request = new NextRequest("http://localhost:3000/api/test");

      // Mock headers
      request.headers.set("x-user-id", mockContext.userId);
      request.headers.set("x-user-role", mockContext.role);
      request.headers.set("x-user-email", mockContext.email);
      request.headers.set("x-administrator-id", mockContext.administratorId!);

      const result = getTenantContext(request);

      expect(result).toEqual(mockContext);
    });

    it("should extract tenant context from request headers for owner", () => {
      const mockContext = createMockOwnerContext();
      const request = new NextRequest("http://localhost:3000/api/test");

      // Mock headers
      request.headers.set("x-user-id", mockContext.userId);
      request.headers.set("x-user-role", mockContext.role);
      request.headers.set("x-user-email", mockContext.email);
      request.headers.set("x-owner-id", mockContext.ownerId!);

      const result = getTenantContext(request);

      expect(result).toEqual(mockContext);
    });

    it("should return null when required headers are missing", () => {
      const request = new NextRequest("http://localhost:3000/api/test");

      // Only set some headers
      request.headers.set("x-user-id", faker.string.uuid());
      // Missing role and email

      const result = getTenantContext(request);

      expect(result).toBeNull();
    });

    it("should handle missing optional headers", () => {
      const request = new NextRequest("http://localhost:3000/api/test");

      request.headers.set("x-user-id", faker.string.uuid());
      request.headers.set("x-user-role", "ADMINISTRATOR");
      request.headers.set("x-user-email", faker.internet.email());
      // No administrator-id or owner-id

      const result = getTenantContext(request);

      expect(result).not.toBeNull();
      expect(result?.administratorId).toBeUndefined();
      expect(result?.ownerId).toBeUndefined();
    });
  });

  describe("getTenantContextFromToken", () => {
    it("should extract tenant context from valid JWT for administrator", async () => {
      const mockContext = createMockAdministratorContext();
      const token = await createMockJWT(mockContext);

      // Mock jwtVerify to return the expected payload
      (jwtVerify as jest.Mock).mockResolvedValueOnce({
        payload: mockContext,
      });

      const result = await getTenantContextFromToken(token);

      expect(result).toEqual(mockContext);
    });

    it("should extract tenant context from valid JWT for owner", async () => {
      const mockContext = createMockOwnerContext();
      const token = await createMockJWT(mockContext);

      // Mock jwtVerify to return the expected payload
      (jwtVerify as jest.Mock).mockResolvedValueOnce({
        payload: mockContext,
      });

      const result = await getTenantContextFromToken(token);

      expect(result).toEqual(mockContext);
    });

    it("should return null for invalid JWT", async () => {
      const invalidToken = "invalid.jwt.token";

      // Mock jwtVerify to throw an error for invalid token
      (jwtVerify as jest.Mock).mockRejectedValueOnce(
        new Error("Invalid token")
      );

      const result = await getTenantContextFromToken(invalidToken);

      expect(result).toBeNull();
    });

    it("should return null for expired JWT", async () => {
      const expiredPayload = createMockAdministratorContext();
      const expiredToken = await new SignJWT(expiredPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("0s") // Expired immediately
        .sign(secret);

      // Mock jwtVerify to throw an error for expired token
      (jwtVerify as jest.Mock).mockRejectedValueOnce(
        new Error("Token expired")
      );

      const result = await getTenantContextFromToken(expiredToken);

      expect(result).toBeNull();
    });
  });

  describe("createBuildingFilter", () => {
    it("should create filter for administrator", () => {
      const context = createMockAdministratorContext();

      const filter = createBuildingFilter(context);

      expect(filter).toEqual({
        administratorId: context.administratorId,
      });
    });

    it("should throw error for owner trying to access buildings", () => {
      const context = createMockOwnerContext();

      try {
        createBuildingFilter(context);
        fail("Expected function to throw an error");
      } catch (error) {
        expect(error).toEqual(
          new Error("Owners cannot directly access buildings")
        );
      }
    });

    it("should throw error for administrator without administratorId", () => {
      const context: TenantContext = {
        userId: faker.string.uuid(),
        role: "ADMINISTRATOR",
        email: faker.internet.email(),
      };

      try {
        createBuildingFilter(context);
        fail("Expected function to throw an error");
      } catch (error) {
        expect(error).toEqual(
          new Error("Owners cannot directly access buildings")
        );
      }
    });
  });

  describe("createApartmentFilter", () => {
    it("should create filter for administrator", () => {
      const context = createMockAdministratorContext();

      const filter = createApartmentFilter(context);

      expect(filter).toEqual({
        building: {
          administratorId: context.administratorId,
        },
      });
    });

    it("should create filter for owner", () => {
      const context = createMockOwnerContext();

      const filter = createApartmentFilter(context);

      expect(filter).toEqual({
        ownerId: context.ownerId,
      });
    });

    it("should throw error for invalid context", () => {
      const context: TenantContext = {
        userId: faker.string.uuid(),
        role: "ADMINISTRATOR",
        email: faker.internet.email(),
      };

      try {
        createApartmentFilter(context);
        fail("Expected function to throw an error");
      } catch (error) {
        expect(error).toEqual(
          new Error("Invalid tenant context for apartment access")
        );
      }
    });
  });

  describe("createWaterReadingFilter", () => {
    it("should create filter for administrator", () => {
      const context = createMockAdministratorContext();

      const filter = createWaterReadingFilter(context);

      expect(filter).toEqual({
        apartment: {
          building: {
            administratorId: context.administratorId,
          },
        },
      });
    });

    it("should create filter for owner", () => {
      const context = createMockOwnerContext();

      const filter = createWaterReadingFilter(context);

      expect(filter).toEqual({
        apartment: {
          ownerId: context.ownerId,
        },
      });
    });

    it("should throw error for invalid context", () => {
      const context: TenantContext = {
        userId: faker.string.uuid(),
        role: "OWNER",
        email: faker.internet.email(),
      };

      try {
        createWaterReadingFilter(context);
        fail("Expected function to throw an error");
      } catch (error) {
        expect(error).toEqual(
          new Error("Invalid tenant context for water reading access")
        );
      }
    });
  });

  describe("canAccessBuilding", () => {
    it("should allow access for administrator with matching administratorId", () => {
      const context = createMockAdministratorContext();
      const buildingAdministratorId = context.administratorId!;

      const result = canAccessBuilding(context, buildingAdministratorId);

      expect(result).toBe(true);
    });

    it("should deny access for administrator with different administratorId", () => {
      const context = createMockAdministratorContext();
      const differentAdministratorId = faker.string.uuid();

      const result = canAccessBuilding(context, differentAdministratorId);

      expect(result).toBe(false);
    });

    it("should deny access for owner", () => {
      const context = createMockOwnerContext();
      const buildingAdministratorId = faker.string.uuid();

      const result = canAccessBuilding(context, buildingAdministratorId);

      expect(result).toBe(false);
    });

    it("should deny access for administrator without administratorId", () => {
      const context: TenantContext = {
        userId: faker.string.uuid(),
        role: "ADMINISTRATOR",
        email: faker.internet.email(),
      };
      const buildingAdministratorId = faker.string.uuid();

      const result = canAccessBuilding(context, buildingAdministratorId);

      expect(result).toBe(false);
    });
  });

  describe("canAccessApartment", () => {
    it("should allow administrator access to apartment in their building", () => {
      const context = createMockAdministratorContext();
      const apartment = {
        ownerId: faker.string.uuid(),
        building: {
          administratorId: context.administratorId!,
        },
      };

      const result = canAccessApartment(context, apartment);

      expect(result).toBe(true);
    });

    it("should deny administrator access to apartment in different building", () => {
      const context = createMockAdministratorContext();
      const apartment = {
        ownerId: faker.string.uuid(),
        building: {
          administratorId: faker.string.uuid(),
        },
      };

      const result = canAccessApartment(context, apartment);

      expect(result).toBe(false);
    });

    it("should allow owner access to their own apartment", () => {
      const context = createMockOwnerContext();
      const apartment = {
        ownerId: context.ownerId!,
        building: {
          administratorId: faker.string.uuid(),
        },
      };

      const result = canAccessApartment(context, apartment);

      expect(result).toBe(true);
    });

    it("should deny owner access to different owner's apartment", () => {
      const context = createMockOwnerContext();
      const apartment = {
        ownerId: faker.string.uuid(),
        building: {
          administratorId: faker.string.uuid(),
        },
      };

      const result = canAccessApartment(context, apartment);

      expect(result).toBe(false);
    });

    it("should deny access for invalid context", () => {
      const context: TenantContext = {
        userId: faker.string.uuid(),
        role: "OWNER",
        email: faker.internet.email(),
      };
      const apartment = {
        ownerId: faker.string.uuid(),
        building: {
          administratorId: faker.string.uuid(),
        },
      };

      const result = canAccessApartment(context, apartment);

      expect(result).toBe(false);
    });

    it("should handle apartment with null ownerId", () => {
      const context = createMockOwnerContext();
      const apartment = {
        ownerId: null,
        building: {
          administratorId: faker.string.uuid(),
        },
      };

      const result = canAccessApartment(context, apartment);

      expect(result).toBe(false);
    });
  });
});
