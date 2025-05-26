import { NextRequest } from "next/server";
import { TenantService } from "../../src/services/tenant.service";

// Mock NextRequest
const createMockRequest = (headers: Record<string, string>) => {
  const mockHeaders = new Map();
  Object.entries(headers).forEach(([key, value]) => {
    mockHeaders.set(key, value);
  });

  return {
    headers: {
      get: (key: string) => mockHeaders.get(key) || null,
    },
  } as NextRequest;
};

describe("TenantService", () => {
  describe("getTenantContext", () => {
    it("should return tenant context for administrator", () => {
      const mockRequest = createMockRequest({
        "x-user-id": "user-123",
        "x-user-role": "ADMINISTRATOR",
        "x-administrator-id": "admin-456",
        "x-user-email": "admin@example.com",
      });

      const result = TenantService.getTenantContext(mockRequest);

      expect(result).toEqual({
        userId: "user-123",
        role: "ADMINISTRATOR",
        administratorId: "admin-456",
        ownerId: undefined,
        email: "admin@example.com",
      });
    });

    it("should return tenant context for owner", () => {
      const mockRequest = createMockRequest({
        "x-user-id": "user-789",
        "x-user-role": "OWNER",
        "x-owner-id": "owner-101",
        "x-user-email": "owner@example.com",
      });

      const result = TenantService.getTenantContext(mockRequest);

      expect(result).toEqual({
        userId: "user-789",
        role: "OWNER",
        administratorId: undefined,
        ownerId: "owner-101",
        email: "owner@example.com",
      });
    });

    it("should return tenant context without optional IDs", () => {
      const mockRequest = createMockRequest({
        "x-user-id": "user-999",
        "x-user-role": "OWNER",
        "x-user-email": "user@example.com",
      });

      const result = TenantService.getTenantContext(mockRequest);

      expect(result).toEqual({
        userId: "user-999",
        role: "OWNER",
        administratorId: undefined,
        ownerId: undefined,
        email: "user@example.com",
      });
    });

    it("should return null when user ID is missing", () => {
      const mockRequest = createMockRequest({
        "x-user-role": "ADMINISTRATOR",
        "x-user-email": "admin@example.com",
      });

      const result = TenantService.getTenantContext(mockRequest);

      expect(result).toBeNull();
    });

    it("should return null when role is missing", () => {
      const mockRequest = createMockRequest({
        "x-user-id": "user-123",
        "x-user-email": "admin@example.com",
      });

      const result = TenantService.getTenantContext(mockRequest);

      expect(result).toBeNull();
    });

    it("should return null when email is missing", () => {
      const mockRequest = createMockRequest({
        "x-user-id": "user-123",
        "x-user-role": "ADMINISTRATOR",
      });

      const result = TenantService.getTenantContext(mockRequest);

      expect(result).toBeNull();
    });

    it("should return null when all headers are missing", () => {
      const mockRequest = createMockRequest({});

      const result = TenantService.getTenantContext(mockRequest);

      expect(result).toBeNull();
    });

    it("should handle empty string headers as missing", () => {
      const mockRequest = createMockRequest({
        "x-user-id": "",
        "x-user-role": "ADMINISTRATOR",
        "x-user-email": "admin@example.com",
      });

      const result = TenantService.getTenantContext(mockRequest);

      expect(result).toBeNull();
    });
  });
});
