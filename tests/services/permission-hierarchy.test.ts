import { PermissionService } from "../permission.service";
import type { PermissionCheck } from "@/types/permission";

describe("Permission Hierarchy Logic", () => {
  describe("hasPermissionFromString", () => {
    it("should allow exact permission matches", () => {
      const permissions = ["buildings:read:own", "apartments:create:building"];

      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "buildings",
          action: "read",
          scope: "own",
        })
      ).toBe(true);

      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "apartments",
          action: "create",
          scope: "building",
        })
      ).toBe(true);
    });

    it('should apply hierarchy: "all" scope allows "building" and "own"', () => {
      const permissions = ["buildings:read:all"];

      // User with "all" should be able to access "building" scope
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "buildings",
          action: "read",
          scope: "building",
        })
      ).toBe(true);

      // User with "all" should be able to access "own" scope
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "buildings",
          action: "read",
          scope: "own",
        })
      ).toBe(true);
    });

    it('should apply hierarchy: "building" scope allows "own"', () => {
      const permissions = ["apartments:read:building"];

      // User with "building" should be able to access "own" scope
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "apartments",
          action: "read",
          scope: "own",
        })
      ).toBe(true);

      // But should NOT be able to access "all" scope
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "apartments",
          action: "read",
          scope: "all",
        })
      ).toBe(false);
    });

    it("should NOT allow reverse hierarchy", () => {
      const permissions = ["buildings:read:own"];

      // User with "own" should NOT be able to access "building" scope
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "buildings",
          action: "read",
          scope: "building",
        })
      ).toBe(false);

      // User with "own" should NOT be able to access "all" scope
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "buildings",
          action: "read",
          scope: "all",
        })
      ).toBe(false);
    });

    it("should respect resource and action boundaries", () => {
      const permissions = ["buildings:read:all"];

      // Different resource should not match
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "apartments",
          action: "read",
          scope: "own",
        })
      ).toBe(false);

      // Different action should not match
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "buildings",
          action: "create",
          scope: "own",
        })
      ).toBe(false);
    });

    it("should handle null scope correctly", () => {
      const permissions = ["roles:create:null"];

      // Exact match should work
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "roles",
          action: "create",
          scope: undefined,
        })
      ).toBe(true);

      // No hierarchy for null scope
      expect(
        PermissionService.hasPermissionFromString(permissions, {
          resource: "roles",
          action: "create",
          scope: "own",
        })
      ).toBe(false);
    });

    it("should demonstrate real-world scenario: SUPER_ADMIN access", () => {
      // SUPER_ADMIN typically has "all" permissions
      const superAdminPermissions = [
        "buildings:read:all",
        "apartments:read:all",
        "users:read:all",
        "water_readings:read:all",
      ];

      // Should be able to access dashboard (which requires apartments:read:own)
      expect(
        PermissionService.hasPermissionFromString(superAdminPermissions, {
          resource: "apartments",
          action: "read",
          scope: "own",
        })
      ).toBe(true);

      // Should be able to access building-specific data
      expect(
        PermissionService.hasPermissionFromString(superAdminPermissions, {
          resource: "buildings",
          action: "read",
          scope: "building",
        })
      ).toBe(true);

      // Should be able to access water readings
      expect(
        PermissionService.hasPermissionFromString(superAdminPermissions, {
          resource: "water_readings",
          action: "read",
          scope: "own",
        })
      ).toBe(true);
    });
  });
});
