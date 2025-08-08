import { CreateBuildingInput } from "@/lib/validations/building";
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma.mock";
import { buildingService } from "@/services/building.service";
import { faker } from "@faker-js/faker";
import type { BuildingType } from "@prisma/client";
import { ErrorServiceResult } from "@/types/api-response";

describe("BuildingService", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  describe("createBuilding", () => {
    it("should create a building with auto-generated code successfully", async () => {
      const organizationId = faker.string.uuid();
      const mockInput = {
        name: "Test Building",
        address: "123 Test Street",
        type: "RESIDENTIAL" as BuildingType,
        floors: 5,
        totalApartments: 10,
        description: "Test description",
        organizationId,
      };

      const mockCreatedBuilding = {
        id: faker.string.uuid(),
        code: "ABC123DE", // Mock generated code
        ...mockInput,
        readingDay: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organization: {
          id: organizationId,
          name: "Test Organization",
          code: "TEST_ORG",
        },
      };

      // Mock organization existence check
      mockPrisma.organization.findUnique.mockResolvedValueOnce({
        id: organizationId,
        name: "Test Organization",
        code: "TEST_ORG",
      });

      // Mock code uniqueness check (first call returns null = unique)
      mockPrisma.building.findFirst.mockResolvedValueOnce(null);

      // Mock building creation
      mockPrisma.building.create.mockResolvedValueOnce(
        mockCreatedBuilding as any
      );

      const result = await buildingService.createBuilding(mockInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.code).toMatch(/^[A-Z0-9]{8}$/); // 8-character alphanumeric
      expect(result.data!.name).toBe(mockInput.name);
      expect(result.data!.organizationId).toBe(organizationId);
      expect(result.data!.readingDay).toBe(15); // Default value

      // Verify database calls
      expect(mockPrisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          code: expect.any(String),
          organizationId,
        },
      });

      expect(mockPrisma.building.create).toHaveBeenCalledWith({
        data: {
          name: mockInput.name,
          code: expect.stringMatching(/^[A-Z0-9]{8}$/),
          address: mockInput.address,
          type: mockInput.type,
          floors: mockInput.floors,
          totalApartments: mockInput.totalApartments,
          description: mockInput.description,
          readingDay: 15,
          organizationId,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });
    });

    it("should use custom readingDay when provided", async () => {
      const organizationId = faker.string.uuid();
      const mockInput: CreateBuildingInput = {
        name: "Test Building",
        address: "123 Test Street",
        type: "COMMERCIAL" as BuildingType,
        floors: 10,
        readingDay: 25,
        organizationId,
        totalApartments: 10,
        description: "Test description",
      };

      const mockCreatedBuilding = {
        id: faker.string.uuid(),
        code: "XYZ789AB",
        ...mockInput,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organization: {
          id: organizationId,
          name: "Test Organization",
          code: "TEST_ORG",
        },
      };

      // Mock organization existence check
      mockPrisma.organization.findUnique.mockResolvedValueOnce({
        id: organizationId,
        name: "Test Organization",
        code: "TEST_ORG",
      });

      mockPrisma.building.findFirst.mockResolvedValueOnce(null);
      mockPrisma.building.create.mockResolvedValueOnce(
        mockCreatedBuilding as any
      );

      const result = await buildingService.createBuilding(mockInput);

      expect(result.success).toBe(true);
      expect(result.data!.readingDay).toBe(25);
    });

    it("should generate unique code if first attempt conflicts", async () => {
      const organizationId = faker.string.uuid();
      const mockInput: CreateBuildingInput = {
        name: "Test Building",
        address: "123 Test Street",
        type: "MIXED" as BuildingType,
        floors: 3,
        totalApartments: 10,
        description: "Test description",
        organizationId,
      };

      // Mock organization existence check
      mockPrisma.organization.findUnique.mockResolvedValueOnce({
        id: organizationId,
        name: "Test Organization",
        code: "TEST_ORG",
      });

      // Mock first code check returns existing building (conflict)
      const existingBuilding = { id: faker.string.uuid() };
      mockPrisma.building.findFirst
        .mockResolvedValueOnce(existingBuilding as any) // First code conflicts
        .mockResolvedValueOnce(null); // Second code is unique

      const mockCreatedBuilding = {
        id: faker.string.uuid(),
        code: "UNIQUE12",
        ...mockInput,
        readingDay: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organization: {
          id: organizationId,
          name: "Test Organization",
          code: "TEST_ORG",
        },
      };

      mockPrisma.building.create.mockResolvedValueOnce(
        mockCreatedBuilding as any
      );

      const result = await buildingService.createBuilding(mockInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.building.findFirst).toHaveBeenCalledTimes(2); // Two uniqueness checks
    });

    it("should fail if unable to generate unique code after max attempts", async () => {
      const organizationId = faker.string.uuid();
      const mockInput: CreateBuildingInput = {
        name: "Test Building",
        address: "123 Test Street",
        type: "RESIDENTIAL" as BuildingType,
        floors: 5,
        organizationId,
        totalApartments: 10,
        description: "Test description",
      };

      // Mock organization existence check
      mockPrisma.organization.findUnique.mockResolvedValueOnce({
        id: organizationId,
        name: "Test Organization",
        code: "TEST_ORG",
      });

      // Mock all code checks return conflicts
      const existingBuilding = { id: faker.string.uuid() };
      mockPrisma.building.findFirst.mockResolvedValue(existingBuilding as any);

      const result = await buildingService.createBuilding(mockInput);

      expect(result.success).toBe(false);
      expect((result as ErrorServiceResult).error).toContain(
        "Nu s-a putut genera un cod unic pentru clădire după mai multe încercări"
      );
      expect(mockPrisma.building.create).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const organizationId = faker.string.uuid();
      const mockInput: CreateBuildingInput = {
        name: "Test Building",
        address: "123 Test Street",
        type: "RESIDENTIAL" as BuildingType,
        floors: 5,
        organizationId,
        totalApartments: 10,
        description: "Test description",
      };

      // Mock organization existence check
      mockPrisma.organization.findUnique.mockResolvedValueOnce({
        id: organizationId,
        name: "Test Organization",
        code: "TEST_ORG",
      });

      mockPrisma.building.findFirst.mockResolvedValueOnce(null);
      mockPrisma.building.create.mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const result = await buildingService.createBuilding(mockInput);

      expect(result.success).toBe(false);
      expect((result as ErrorServiceResult).error).toBe(
        "Database connection failed"
      );
    });
  });

  describe("getBuildingsByOrg", () => {
    it("should return buildings for the specified organization", async () => {
      const organizationId = faker.string.uuid();
      const userId = faker.string.uuid();
      const userRoles = ["MEMBER"];
      const mockBuildings = [
        {
          id: faker.string.uuid(),
          name: "Building 1",
          code: "BLDG001A",
          address: "123 Street",
          type: "RESIDENTIAL",
          floors: 5,
          totalApartments: 20,
          readingDay: 15,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          organization: {
            id: organizationId,
            name: "Test Org",
            code: "TEST",
          },
          apartments: [],
        },
        {
          id: faker.string.uuid(),
          name: "Building 2",
          code: "BLDG002B",
          address: "456 Avenue",
          type: "COMMERCIAL",
          floors: 10,
          totalApartments: 30,
          readingDay: 20,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          organization: {
            id: organizationId,
            name: "Test Org",
            code: "TEST",
          },
          apartments: [],
        },
      ];

      // Mock user organization access check
      mockPrisma.userOrganization.findFirst.mockResolvedValueOnce({
        userId,
        organizationId,
        id: faker.string.uuid(),
        joinedAt: new Date(),
        role: "MEMBER",
      });

      mockPrisma.building.findMany.mockResolvedValueOnce(mockBuildings as any);

      const result = await buildingService.getBuildingsByOrg(
        organizationId,
        userId,
        userRoles
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].name).toBe("Building 1");
      expect(result.data![1].name).toBe("Building 2");

      expect(mockPrisma.building.findMany).toHaveBeenCalledWith({
        where: {
          organizationId,
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should return empty array when no buildings exist", async () => {
      const organizationId = faker.string.uuid();
      const userId = faker.string.uuid();
      const userRoles = ["MEMBER"];

      // Mock user organization access check
      mockPrisma.userOrganization.findFirst.mockResolvedValueOnce({
        userId,
        organizationId,
        id: faker.string.uuid(),
        joinedAt: new Date(),
        role: "MEMBER",
      });

      mockPrisma.building.findMany.mockResolvedValueOnce([]);

      const result = await buildingService.getBuildingsByOrg(
        organizationId,
        userId,
        userRoles
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle database errors gracefully", async () => {
      const organizationId = faker.string.uuid();
      const userId = faker.string.uuid();
      const userRoles = ["MEMBER"];

      // Mock user organization access check to succeed
      mockPrisma.userOrganization.findFirst.mockResolvedValueOnce({
        userId,
        organizationId,
        id: faker.string.uuid(),
        joinedAt: new Date(),
        role: "MEMBER",
      });

      // Then make building.findMany fail
      mockPrisma.building.findMany.mockRejectedValueOnce(
        new Error("Database error")
      );

      const result = await buildingService.getBuildingsByOrg(
        organizationId,
        userId,
        userRoles
      );

      expect(result.success).toBe(false);
      expect((result as ErrorServiceResult).error).toBe(
        "Eroare la preluarea clădirilor"
      );
    });
  });

  describe("getBuildingById", () => {
    it("should return building when found and user has access", async () => {
      const organizationId = faker.string.uuid();
      const buildingId = faker.string.uuid();
      const userId = faker.string.uuid();
      const mockBuilding = {
        id: buildingId,
        name: "Test Building",
        code: "TESTBLDG",
        address: "123 Test Street",
        type: "RESIDENTIAL",
        floors: 5,
        totalApartments: 25,
        readingDay: 15,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organization: {
          id: organizationId,
          name: "Test Org",
          code: "TEST",
        },
        apartments: [],
      };

      mockPrisma.building.findFirst.mockResolvedValueOnce(mockBuilding as any);

      const result = await buildingService.getBuildingById(buildingId, userId, [
        "SUPER_ADMIN",
      ]);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe(buildingId);
      expect(result.data!.organizationId).toBe(organizationId);
    });

    it("should return null when building not found", async () => {
      const buildingId = faker.string.uuid();
      const userId = faker.string.uuid();

      mockPrisma.building.findFirst.mockResolvedValueOnce(null);

      const result = await buildingService.getBuildingById(buildingId, userId, [
        "SUPER_ADMIN",
      ]);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should enforce user access control", async () => {
      const buildingId = faker.string.uuid();
      const userId = faker.string.uuid();

      // User doesn't have access to building (returns null)
      mockPrisma.building.findFirst.mockResolvedValueOnce(null);

      const result = await buildingService.getBuildingById(buildingId, userId, [
        "MEMBER",
      ]);

      expect(result.success).toBe(false);
      expect((result as ErrorServiceResult).error).toBe(
        "Clădirea nu a fost găsită sau nu aveți acces la ea"
      );

      expect(mockPrisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          id: buildingId,
          deletedAt: null,
          organization: {
            users: {
              some: {
                userId: userId,
              },
            },
          },
        },
        include: expect.any(Object),
      });
    });
  });

  describe("getBuildingByCode", () => {
    it("should return building when code exists in organization", async () => {
      const organizationId = faker.string.uuid();
      const buildingCode = "TESTCODE";
      const mockBuilding = {
        id: faker.string.uuid(),
        name: "Test Building",
        code: buildingCode,
        address: "123 Test Street",
        type: "RESIDENTIAL",
        floors: 5,
        totalApartments: 15,
        readingDay: 15,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organization: {
          id: organizationId,
          name: "Test Org",
          code: "TEST",
        },
      };

      mockPrisma.building.findFirst.mockResolvedValueOnce(mockBuilding as any);

      const result = await buildingService.getBuildingByCode(
        buildingCode,
        organizationId
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.code).toBe(buildingCode);

      expect(mockPrisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          code: buildingCode.toUpperCase(),
          organizationId,
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });
    });

    it("should convert code to uppercase for search", async () => {
      const organizationId = faker.string.uuid();
      const buildingCode = "testcode"; // lowercase input

      mockPrisma.building.findFirst.mockResolvedValueOnce(null);

      await buildingService.getBuildingByCode(buildingCode, organizationId);

      expect(mockPrisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          code: "TESTCODE", // Should be converted to uppercase
          organizationId,
          deletedAt: null,
        },
        include: expect.any(Object),
      });
    });

    it("should enforce organization isolation for code search", async () => {
      const organizationId = faker.string.uuid();
      const buildingCode = "SHARED123";

      // Code exists but in different organization
      mockPrisma.building.findFirst.mockResolvedValueOnce(null);

      const result = await buildingService.getBuildingByCode(
        buildingCode,
        organizationId
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();

      expect(mockPrisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          code: buildingCode,
          organizationId, // Ensures organization isolation
          deletedAt: null,
        },
        include: expect.any(Object),
      });
    });
  });

  describe("Multi-Tenancy Testing", () => {
    it("should isolate buildings between different organizations", async () => {
      const org1Id = faker.string.uuid();
      const org2Id = faker.string.uuid();
      const userId = faker.string.uuid();
      const userRoles = ["MEMBER"];

      // Mock buildings for org1
      const org1Buildings = [
        {
          id: faker.string.uuid(),
          name: "Org1 Building",
          code: "ORG1BLDG",
          organizationId: org1Id,
          totalApartments: 10,
        },
      ];

      // Mock buildings for org2
      const org2Buildings = [
        {
          id: faker.string.uuid(),
          name: "Org2 Building",
          code: "ORG2BLDG",
          organizationId: org2Id,
          totalApartments: 15,
        },
      ];

      // Mock user organization access for both orgs
      mockPrisma.userOrganization.findFirst
        .mockResolvedValueOnce({
          userId,
          organizationId: org1Id,
          id: faker.string.uuid(),
          joinedAt: new Date(),
          role: "MEMBER",
        })
        .mockResolvedValueOnce({
          userId,
          organizationId: org2Id,
          id: faker.string.uuid(),
          joinedAt: new Date(),
          role: "MEMBER",
        });

      mockPrisma.building.findMany
        .mockResolvedValueOnce(org1Buildings as any)
        .mockResolvedValueOnce(org2Buildings as any);

      const result1 = await buildingService.getBuildingsByOrg(
        org1Id,
        userId,
        userRoles
      );
      const result2 = await buildingService.getBuildingsByOrg(
        org2Id,
        userId,
        userRoles
      );

      expect(result1.data![0].name).toBe("Org1 Building");
      expect(result2.data![0].name).toBe("Org2 Building");

      // Verify each call filters by the correct organization
      expect(mockPrisma.building.findMany).toHaveBeenNthCalledWith(1, {
        where: {
          organizationId: org1Id,
          deletedAt: null,
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });

      expect(mockPrisma.building.findMany).toHaveBeenNthCalledWith(2, {
        where: {
          organizationId: org2Id,
          deletedAt: null,
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it("should allow same building codes in different organizations", async () => {
      const org1Id = faker.string.uuid();
      const org2Id = faker.string.uuid();
      const sameCode = "SAMECODE";

      const mockBuilding1 = {
        id: faker.string.uuid(),
        code: sameCode,
        organizationId: org1Id,
        name: "Org1 Building",
        totalApartments: 12,
      };

      const mockBuilding2 = {
        id: faker.string.uuid(),
        code: sameCode,
        organizationId: org2Id,
        name: "Org2 Building",
        totalApartments: 18,
      };

      mockPrisma.building.findFirst
        .mockResolvedValueOnce(mockBuilding1 as any)
        .mockResolvedValueOnce(mockBuilding2 as any);

      const result1 = await buildingService.getBuildingByCode(sameCode, org1Id);
      const result2 = await buildingService.getBuildingByCode(sameCode, org2Id);

      expect(result1.data!.name).toBe("Org1 Building");
      expect(result2.data!.name).toBe("Org2 Building");
      expect(result1.data!.organizationId).toBe(org1Id);
      expect(result2.data!.organizationId).toBe(org2Id);
    });
  });
});
