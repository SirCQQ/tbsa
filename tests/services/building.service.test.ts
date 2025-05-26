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

import { BuildingsService } from "../../src/services/buildings.service";
import {
  createMockAdministratorContext,
  createMockBuilding,
} from "../__mocks__/data.mock";

describe("BuildingsService", () => {
  let adminContext: ReturnType<typeof createMockAdministratorContext>;

  beforeEach(() => {
    resetPrismaMocks();
    mockConsoleError.mockClear();
    adminContext = createMockAdministratorContext();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("getBuildings", () => {
    it("should return paginated buildings for administrator", async () => {
      const mockBuildings = [
        createMockBuilding(adminContext.administratorId!),
        createMockBuilding(adminContext.administratorId!),
      ];

      mockPrisma.building.findMany.mockResolvedValue(mockBuildings);
      mockPrisma.building.count.mockResolvedValue(2);

      const result = await BuildingsService.getBuildings(
        adminContext.administratorId!,
        { page: "1", limit: "10" }
      );

      expect(result.success).toBe(true);
      expect(result.data?.buildings).toEqual(mockBuildings);
      expect(result.data?.pagination.total).toBe(2);
      expect(mockPrisma.building.findMany).toHaveBeenCalledWith({
        where: { administratorId: adminContext.administratorId },
        skip: 0,
        take: 10,
        include: {
          _count: { select: { apartments: true } },
          administrator: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });
    });

    it("should handle search functionality", async () => {
      const mockBuildings = [createMockBuilding(adminContext.administratorId!)];

      mockPrisma.building.findMany.mockResolvedValue(mockBuildings);
      mockPrisma.building.count.mockResolvedValue(1);

      const result = await BuildingsService.getBuildings(
        adminContext.administratorId!,
        { page: "1", limit: "10", search: "Test" }
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.building.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: "Test", mode: "insensitive" } },
            { address: { contains: "Test", mode: "insensitive" } },
            { city: { contains: "Test", mode: "insensitive" } },
          ],
          administratorId: adminContext.administratorId,
        },
        skip: 0,
        take: 10,
        include: expect.any(Object),
        orderBy: { name: "asc" },
      });
    });

    it("should handle validation errors", async () => {
      const result = await BuildingsService.getBuildings(
        adminContext.administratorId!,
        { page: "invalid", limit: "10" }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("VALIDATION_FAILED");
      expect(result.error).toBe("Parametrii de interogare sunt invalizi");
    });

    it("should handle database errors", async () => {
      mockPrisma.building.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const result = await BuildingsService.getBuildings(
        adminContext.administratorId!,
        { page: "1", limit: "10" }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("INTERNAL_ERROR");
      expect(result.error).toBe("Eroare internă la obținerea clădirilor");
    });
  });

  describe("getBuildingById", () => {
    it("should return building for authorized administrator", async () => {
      const buildingId = "550e8400-e29b-41d4-a716-446655440000"; // Valid UUID
      const mockBuilding = createMockBuilding(adminContext.administratorId!);
      mockBuilding.id = buildingId;

      mockPrisma.building.findFirst.mockResolvedValue(mockBuilding);

      const result = await BuildingsService.getBuildingById(
        buildingId,
        adminContext.administratorId!
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBuilding);
      expect(mockPrisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          id: buildingId,
          administratorId: adminContext.administratorId,
        },
        include: {
          _count: { select: { apartments: true } },
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
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
              _count: { select: { waterReadings: true } },
            },
            orderBy: { number: "asc" },
          },
        },
      });
    });

    it("should return not found for non-existent building", async () => {
      const buildingId = "550e8400-e29b-41d4-a716-446655440001"; // Valid UUID
      mockPrisma.building.findFirst.mockResolvedValue(null);

      const result = await BuildingsService.getBuildingById(
        buildingId,
        adminContext.administratorId!
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("BUILDING_NOT_FOUND");
      expect(result.error).toBe("Clădirea nu a fost găsită");
    });

    it("should handle invalid building ID", async () => {
      const result = await BuildingsService.getBuildingById(
        "invalid-id",
        adminContext.administratorId!
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("VALIDATION_FAILED");
      expect(result.error).toBe("ID-ul clădirii este invalid");
    });
  });

  describe("createBuilding", () => {
    it("should create building for administrator", async () => {
      const buildingData = {
        name: "Test Building",
        address: "123 Test Street",
        city: "Test City",
        postalCode: "123456",
        readingDeadline: 25,
      };
      const mockCreatedBuilding = createMockBuilding(
        adminContext.administratorId!
      );

      mockPrisma.building.findFirst.mockResolvedValue(null); // No existing building
      mockPrisma.building.create.mockResolvedValue(mockCreatedBuilding);

      const result = await BuildingsService.createBuilding(
        buildingData,
        adminContext.administratorId!
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedBuilding);
      expect(mockPrisma.building.create).toHaveBeenCalledWith({
        data: {
          ...buildingData,
          administratorId: adminContext.administratorId,
        },
        include: expect.any(Object),
      });
    });

    it("should prevent duplicate buildings", async () => {
      const buildingData = {
        name: "Test Building",
        address: "123 Test Street",
        city: "Test City",
        postalCode: "123456",
        readingDeadline: 25,
      };
      const existingBuilding = createMockBuilding(
        adminContext.administratorId!
      );

      mockPrisma.building.findFirst.mockResolvedValue(existingBuilding);

      const result = await BuildingsService.createBuilding(
        buildingData,
        adminContext.administratorId!
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("BUILDING_ALREADY_EXISTS");
      expect(result.error).toBe(
        "O clădire cu același nume și adresă există deja"
      );
    });

    it("should handle validation errors", async () => {
      const invalidData = {
        name: "", // Invalid empty name
        address: "Test Address",
      };

      const result = await BuildingsService.createBuilding(
        invalidData,
        adminContext.administratorId!
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("VALIDATION_FAILED");
      expect(result.error).toBe("Datele introduse sunt invalide");
    });
  });

  describe("updateBuilding", () => {
    it("should update building for administrator", async () => {
      const buildingId = "550e8400-e29b-41d4-a716-446655440002"; // Valid UUID
      const updateData = { name: "Updated Building" };
      const existingBuilding = createMockBuilding(
        adminContext.administratorId!
      );
      existingBuilding.id = buildingId;
      const updatedBuilding = { ...existingBuilding, ...updateData };

      mockPrisma.building.findFirst
        .mockResolvedValueOnce(existingBuilding) // Building exists
        .mockResolvedValueOnce(null); // No duplicate
      mockPrisma.building.update.mockResolvedValue(updatedBuilding);

      const result = await BuildingsService.updateBuilding(
        buildingId,
        updateData,
        adminContext.administratorId!
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedBuilding);
    });

    it("should return error when building not found", async () => {
      const buildingId = "550e8400-e29b-41d4-a716-446655440003"; // Valid UUID
      const updateData = { name: "Updated Building" };

      mockPrisma.building.findFirst.mockResolvedValue(null);

      const result = await BuildingsService.updateBuilding(
        buildingId,
        updateData,
        adminContext.administratorId!
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("BUILDING_NOT_FOUND");
    });
  });

  describe("deleteBuilding", () => {
    it("should delete building successfully", async () => {
      const buildingId = "550e8400-e29b-41d4-a716-446655440004"; // Valid UUID
      const existingBuilding = createMockBuilding(
        adminContext.administratorId!
      );
      existingBuilding.id = buildingId;
      // Add _count property for the delete method
      const buildingWithCount = {
        ...existingBuilding,
        _count: { apartments: 0 },
      };

      mockPrisma.building.findFirst.mockResolvedValue(buildingWithCount);
      mockPrisma.building.delete.mockResolvedValue(existingBuilding);

      const result = await BuildingsService.deleteBuilding(
        buildingId,
        adminContext.administratorId!
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.building.delete).toHaveBeenCalledWith({
        where: { id: buildingId },
      });
    });

    it("should return error when building not found", async () => {
      const buildingId = "550e8400-e29b-41d4-a716-446655440005"; // Valid UUID

      mockPrisma.building.findFirst.mockResolvedValue(null);

      const result = await BuildingsService.deleteBuilding(
        buildingId,
        adminContext.administratorId!
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("BUILDING_NOT_FOUND");
    });
  });

  describe("getBuildingStats", () => {
    it("should return building statistics successfully", async () => {
      mockPrisma.building.aggregate.mockResolvedValue({ _count: { id: 5 } });
      mockPrisma.apartment.aggregate.mockResolvedValue({ _count: { id: 25 } });

      const result = await BuildingsService.getBuildingStats(
        adminContext.administratorId!
      );

      expect(result.success).toBe(true);
      expect(result.data?.totalBuildings).toBe(5);
      expect(result.data?.totalApartments).toBe(25);
    });

    it("should handle database errors", async () => {
      mockPrisma.building.aggregate.mockRejectedValue(new Error("DB Error"));

      const result = await BuildingsService.getBuildingStats(
        adminContext.administratorId!
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("INTERNAL_ERROR");
    });
  });
});
