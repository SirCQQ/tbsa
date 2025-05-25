import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma.mock";
import { mockJose } from "../__mocks__/jose.mock";

// Mock console.error to prevent pollution during error tests
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock jose library to prevent ES module issues
jest.mock("jose", () => mockJose);

// Mock the prisma module
jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { BuildingService } from "../../src/services/building.service";
import {
  createMockAdministratorContext,
  createMockOwnerContext,
  createMockBuilding,
  createMockBuildingRequest,
  createMockBuildingRequestPartial,
} from "../__mocks__/data.mock";

describe("BuildingService", () => {
  let adminContext: ReturnType<typeof createMockAdministratorContext>;
  let ownerContext: ReturnType<typeof createMockOwnerContext>;

  beforeEach(() => {
    resetPrismaMocks();
    mockConsoleError.mockClear();
    adminContext = createMockAdministratorContext();
    ownerContext = createMockOwnerContext();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("getBuildings", () => {
    it("should return buildings for administrator", async () => {
      const mockBuildings = [
        createMockBuilding(adminContext.administratorId!),
        createMockBuilding(adminContext.administratorId!),
      ];

      mockPrisma.building.findMany.mockResolvedValue(mockBuildings);

      const result = await BuildingService.getBuildings(adminContext);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBuildings);
      expect(mockPrisma.building.findMany).toHaveBeenCalledWith({
        where: { administratorId: adminContext.administratorId },
        include: {
          administrator: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
          apartments: {
            include: {
              owner: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true, email: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });
    });

    it("should deny access for owners", async () => {
      const result = await BuildingService.getBuildings(ownerContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only administrators can access buildings");
      expect(mockPrisma.building.findMany).not.toHaveBeenCalled();
    });

    it("should deny access for administrator without administratorId", async () => {
      const invalidContext = {
        ...adminContext,
        administratorId: undefined,
      };

      const result = await BuildingService.getBuildings(invalidContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only administrators can access buildings");
      expect(mockPrisma.building.findMany).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      mockPrisma.building.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const result = await BuildingService.getBuildings(adminContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Internal server error");
    });
  });

  describe("getBuildingById", () => {
    it("should return building for authorized administrator", async () => {
      const buildingId = "building-1";
      const mockBuilding = createMockBuilding(adminContext.administratorId!);
      mockBuilding.id = buildingId;

      mockPrisma.building.findUnique.mockResolvedValue(mockBuilding);

      const result = await BuildingService.getBuildingById(
        buildingId,
        adminContext
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBuilding);
      expect(mockPrisma.building.findUnique).toHaveBeenCalledWith({
        where: { id: buildingId },
        include: {
          administrator: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
          apartments: {
            include: {
              owner: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true, email: true },
                  },
                },
              },
            },
          },
        },
      });
    });

    it("should deny access to building from different administrator", async () => {
      const buildingId = "building-1";
      const differentAdminId = "different-admin-id";
      const mockBuilding = createMockBuilding(differentAdminId);
      mockBuilding.id = buildingId;

      mockPrisma.building.findUnique.mockResolvedValue(mockBuilding);

      const result = await BuildingService.getBuildingById(
        buildingId,
        adminContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "You don't have permission to access this building"
      );
    });

    it("should return not found for non-existent building", async () => {
      const buildingId = "non-existent";
      mockPrisma.building.findUnique.mockResolvedValue(null);

      const result = await BuildingService.getBuildingById(
        buildingId,
        adminContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Building does not exist");
    });

    it("should deny access for owners", async () => {
      const buildingId = "building-1";

      const result = await BuildingService.getBuildingById(
        buildingId,
        ownerContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only administrators can access buildings");
      expect(mockPrisma.building.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("createBuilding", () => {
    it("should create building for administrator", async () => {
      const buildingData = createMockBuildingRequest();
      const mockCreatedBuilding = createMockBuilding(
        adminContext.administratorId!
      );

      mockPrisma.building.create.mockResolvedValue(mockCreatedBuilding);

      const result = await BuildingService.createBuilding(
        buildingData,
        adminContext
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedBuilding);
      expect(mockPrisma.building.create).toHaveBeenCalledWith({
        data: {
          name: buildingData.name,
          address: buildingData.address,
          city: buildingData.city,
          postalCode: buildingData.postalCode,
          readingDeadline: buildingData.readingDeadline || 25,
          administratorId: adminContext.administratorId,
        },
        include: expect.any(Object),
      });
    });

    it("should deny creation for owners", async () => {
      const buildingData = createMockBuildingRequest();

      const result = await BuildingService.createBuilding(
        buildingData,
        ownerContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only administrators can create buildings");
      expect(mockPrisma.building.create).not.toHaveBeenCalled();
    });

    it("should use default reading deadline if not provided", async () => {
      const fullBuildingData = createMockBuildingRequest();
      const buildingDataWithoutDeadline = {
        name: fullBuildingData.name,
        address: fullBuildingData.address,
        city: fullBuildingData.city,
        postalCode: fullBuildingData.postalCode,
      };
      const mockCreatedBuilding = createMockBuilding(
        adminContext.administratorId!
      );

      mockPrisma.building.create.mockResolvedValue(mockCreatedBuilding);

      const result = await BuildingService.createBuilding(
        buildingDataWithoutDeadline,
        adminContext
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.building.create).toHaveBeenCalledWith({
        data: {
          ...buildingDataWithoutDeadline,
          readingDeadline: 25,
          administratorId: adminContext.administratorId,
        },
        include: expect.any(Object),
      });
    });

    it("should handle database errors", async () => {
      const buildingData = createMockBuildingRequest();
      mockPrisma.building.create.mockRejectedValue(new Error("Database error"));

      const result = await BuildingService.createBuilding(
        buildingData,
        adminContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Internal server error");
    });
  });

  describe("updateBuilding", () => {
    it("should update building for administrator", async () => {
      const buildingId = "building-1";
      const updateData = createMockBuildingRequestPartial();
      const existingBuilding = createMockBuilding(
        adminContext.administratorId!
      );
      existingBuilding.id = buildingId;
      const mockUpdatedBuilding = { ...existingBuilding, ...updateData };

      mockPrisma.building.findUnique.mockResolvedValue(existingBuilding);
      mockPrisma.building.update.mockResolvedValue(mockUpdatedBuilding);

      const result = await BuildingService.updateBuilding(
        buildingId,
        updateData,
        adminContext
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedBuilding);
      expect(mockPrisma.building.findUnique).toHaveBeenCalledWith({
        where: { id: buildingId },
      });
      expect(mockPrisma.building.update).toHaveBeenCalledWith({
        where: { id: buildingId },
        data: updateData,
        include: {
          administrator: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      });
    });

    it("should return error for owner trying to update building", async () => {
      const buildingId = "building-1";
      const updateData = createMockBuildingRequestPartial();

      const result = await BuildingService.updateBuilding(
        buildingId,
        updateData,
        ownerContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only administrators can update buildings");
      expect(mockPrisma.building.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.building.update).not.toHaveBeenCalled();
    });

    it("should handle non-existent building update", async () => {
      const buildingId = "non-existent";
      const updateData = createMockBuildingRequestPartial();
      mockPrisma.building.findUnique.mockResolvedValue(null);

      const result = await BuildingService.updateBuilding(
        buildingId,
        updateData,
        adminContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Building does not exist");
      expect(mockPrisma.building.update).not.toHaveBeenCalled();
    });

    it("should not update building from different administrator", async () => {
      const buildingId = "building-1";
      const updateData = createMockBuildingRequestPartial();
      const differentAdminBuilding = createMockBuilding("different-admin-id");
      differentAdminBuilding.id = buildingId;

      mockPrisma.building.findUnique.mockResolvedValue(differentAdminBuilding);

      const result = await BuildingService.updateBuilding(
        buildingId,
        updateData,
        adminContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "You don't have permission to update this building"
      );
      expect(mockPrisma.building.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteBuilding", () => {
    it("should delete building for administrator", async () => {
      const buildingId = "building-1";
      const existingBuilding = createMockBuilding(
        adminContext.administratorId!
      );
      existingBuilding.id = buildingId;
      existingBuilding.apartments = [];

      mockPrisma.building.findUnique.mockResolvedValue(existingBuilding);
      mockPrisma.building.delete.mockResolvedValue(existingBuilding);

      const result = await BuildingService.deleteBuilding(
        buildingId,
        adminContext
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.building.findUnique).toHaveBeenCalledWith({
        where: { id: buildingId },
        include: { apartments: true },
      });
      expect(mockPrisma.building.delete).toHaveBeenCalledWith({
        where: { id: buildingId },
      });
    });

    it("should return error for owner trying to delete building", async () => {
      const buildingId = "building-1";

      const result = await BuildingService.deleteBuilding(
        buildingId,
        ownerContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only administrators can delete buildings");
      expect(mockPrisma.building.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.building.delete).not.toHaveBeenCalled();
    });

    it("should handle non-existent building deletion", async () => {
      const buildingId = "non-existent";
      mockPrisma.building.findUnique.mockResolvedValue(null);

      const result = await BuildingService.deleteBuilding(
        buildingId,
        adminContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Building does not exist");
      expect(mockPrisma.building.delete).not.toHaveBeenCalled();
    });

    it("should not delete building from different administrator", async () => {
      const buildingId = "building-1";
      const differentAdminBuilding = createMockBuilding("different-admin-id");
      differentAdminBuilding.id = buildingId;
      differentAdminBuilding.apartments = [];

      mockPrisma.building.findUnique.mockResolvedValue(differentAdminBuilding);

      const result = await BuildingService.deleteBuilding(
        buildingId,
        adminContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "You don't have permission to delete this building"
      );
      expect(mockPrisma.building.delete).not.toHaveBeenCalled();
    });

    it("should handle building with apartments", async () => {
      const buildingId = "building-1";
      const existingBuilding = createMockBuilding(
        adminContext.administratorId!
      );
      existingBuilding.id = buildingId;
      existingBuilding.apartments = [
        {
          id: "apt-1",
          number: "101",
          floor: 1,
          rooms: 3,
          buildingId: buildingId,
          ownerId: "owner-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.building.findUnique.mockResolvedValue(existingBuilding);

      const result = await BuildingService.deleteBuilding(
        buildingId,
        adminContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Building has apartments. Please remove all apartments first."
      );
      expect(mockPrisma.building.delete).not.toHaveBeenCalled();
    });
  });

  describe("Multi-tenancy Security Tests", () => {
    it("should ensure complete data isolation between administrators", async () => {
      const admin1Context = createMockAdministratorContext();
      const admin2Context = createMockAdministratorContext();

      const admin1Buildings = [
        createMockBuilding(admin1Context.administratorId!),
      ];
      const admin2Buildings = [
        createMockBuilding(admin2Context.administratorId!),
      ];

      // Admin 1 should only see their buildings
      mockPrisma.building.findMany.mockResolvedValueOnce(admin1Buildings);
      const admin1Result = await BuildingService.getBuildings(admin1Context);

      // Admin 2 should only see their buildings
      mockPrisma.building.findMany.mockResolvedValueOnce(admin2Buildings);
      const admin2Result = await BuildingService.getBuildings(admin2Context);

      expect(admin1Result.success).toBe(true);
      expect(admin2Result.success).toBe(true);
      expect(admin1Result.data).toEqual(admin1Buildings);
      expect(admin2Result.data).toEqual(admin2Buildings);
      expect(admin1Result.data).not.toEqual(admin2Result.data);
    });

    it("should prevent cross-tenant data access in building details", async () => {
      const admin1Context = createMockAdministratorContext();
      const admin2BuildingId = "admin2-building";
      const admin2Building = createMockBuilding("different-admin-id");
      admin2Building.id = admin2BuildingId;

      // Simulate admin1 trying to access admin2's building
      mockPrisma.building.findUnique.mockResolvedValue(admin2Building);

      const result = await BuildingService.getBuildingById(
        admin2BuildingId,
        admin1Context
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "You don't have permission to access this building"
      );
    });
  });
});
