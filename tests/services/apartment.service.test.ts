import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma.mock";
import {
  createMockApartment,
  createMockBuilding,
  createMockAdministratorContext,
  createMockOwnerContext,
} from "../__mocks__/data.mock";
import { ApartmentService } from "../../src/services/apartment.service";
import { ApartmentInput, ApartmentQuery } from "../../src/schemas/apartment";

// Mock console.error to prevent pollution during error tests
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock the prisma module
jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("ApartmentService", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("getApartments", () => {
    it("should get apartments with pagination", async () => {
      const query: ApartmentQuery = {
        page: 1,
        limit: 10,
      };

      const mockApartments = [
        {
          ...createMockApartment("building-1", "owner-1"),
          _count: {
            waterReadings: 5,
          },
        },
      ];

      mockPrisma.apartment.findMany.mockResolvedValue(mockApartments);
      mockPrisma.apartment.count.mockResolvedValue(1);

      const result = await ApartmentService.getApartments(query);

      expect(result.success).toBe(true);
      expect(result.data?.apartments).toEqual(mockApartments);
      expect(result.data?.pagination).toEqual({
        total: 1,
        pages: 1,
        current: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should filter apartments by building ID", async () => {
      const query: ApartmentQuery = {
        page: 1,
        limit: 10,
        buildingId: "building-1",
      };

      const mockApartments = [
        {
          ...createMockApartment("building-1", "owner-1"),
          _count: {
            waterReadings: 5,
          },
        },
      ];

      mockPrisma.apartment.findMany.mockResolvedValue(mockApartments);
      mockPrisma.apartment.count.mockResolvedValue(1);

      await ApartmentService.getApartments(query);

      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            buildingId: "building-1",
          }),
        })
      );
    });

    it("should filter apartments by owner ID", async () => {
      const query: ApartmentQuery = {
        page: 1,
        limit: 10,
        ownerId: "owner-1",
      };

      const mockApartments = [
        {
          ...createMockApartment("building-1", "owner-1"),
          _count: {
            waterReadings: 5,
          },
        },
      ];

      mockPrisma.apartment.findMany.mockResolvedValue(mockApartments);
      mockPrisma.apartment.count.mockResolvedValue(1);

      await ApartmentService.getApartments(query);

      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerId: "owner-1",
          }),
        })
      );
    });

    it("should search apartments by number and building name", async () => {
      const query: ApartmentQuery = {
        page: 1,
        limit: 10,
        search: "101",
      };

      const mockApartments = [
        {
          ...createMockApartment("building-1", "owner-1"),
          _count: {
            waterReadings: 5,
          },
        },
      ];

      mockPrisma.apartment.findMany.mockResolvedValue(mockApartments);
      mockPrisma.apartment.count.mockResolvedValue(1);

      await ApartmentService.getApartments(query);

      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { number: { contains: "101", mode: "insensitive" } },
              { building: { name: { contains: "101", mode: "insensitive" } } },
            ]),
          }),
        })
      );
    });

    it("should apply administrator tenant context", async () => {
      const query: ApartmentQuery = {
        page: 1,
        limit: 10,
      };

      const tenantContext = createMockAdministratorContext();

      const mockApartments = [
        {
          ...createMockApartment("building-1", "owner-1"),
          _count: {
            waterReadings: 5,
          },
        },
      ];

      mockPrisma.apartment.findMany.mockResolvedValue(mockApartments);
      mockPrisma.apartment.count.mockResolvedValue(1);

      await ApartmentService.getApartments(query, tenantContext);

      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            building: {
              administratorId: tenantContext.administratorId,
            },
          }),
        })
      );
    });

    it("should apply owner tenant context", async () => {
      const query: ApartmentQuery = {
        page: 1,
        limit: 10,
      };

      const tenantContext = createMockOwnerContext();

      const mockApartments = [
        {
          ...createMockApartment("building-1", tenantContext.ownerId!),
          _count: {
            waterReadings: 5,
          },
        },
      ];

      mockPrisma.apartment.findMany.mockResolvedValue(mockApartments);
      mockPrisma.apartment.count.mockResolvedValue(1);

      await ApartmentService.getApartments(query, tenantContext);

      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerId: tenantContext.ownerId,
          }),
        })
      );
    });

    it("should handle database errors", async () => {
      const query: ApartmentQuery = {
        page: 1,
        limit: 10,
      };

      mockPrisma.apartment.findMany.mockRejectedValue(new Error("DB Error"));

      const result = await ApartmentService.getApartments(query);

      expect(result.success).toBe(false);
      expect(result.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("getApartmentById", () => {
    it("should get apartment by ID", async () => {
      const mockApartment = {
        ...createMockApartment("building-1", "owner-1"),
        building: {
          ...createMockBuilding("admin-1"),
        },
        _count: {
          waterReadings: 5,
        },
      };

      mockPrisma.apartment.findFirst.mockResolvedValue(mockApartment);

      const result = await ApartmentService.getApartmentById("apt-1");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApartment);
      expect(mockPrisma.apartment.findFirst).toHaveBeenCalledWith({
        where: { id: "apt-1" },
        include: expect.any(Object),
      });
    });

    it("should return not found when apartment doesn't exist", async () => {
      mockPrisma.apartment.findFirst.mockResolvedValue(null);

      const result = await ApartmentService.getApartmentById("nonexistent");

      expect(result.success).toBe(false);
      expect(result.code).toBe("NOT_FOUND");
    });

    it("should apply administrator tenant context", async () => {
      const tenantContext = createMockAdministratorContext();

      const mockApartment = {
        ...createMockApartment("building-1", "owner-1"),
        building: {
          ...createMockBuilding(tenantContext.administratorId!),
        },
        _count: {
          waterReadings: 5,
        },
      };

      mockPrisma.apartment.findFirst.mockResolvedValue(mockApartment);

      await ApartmentService.getApartmentById("apt-1", tenantContext);

      expect(mockPrisma.apartment.findFirst).toHaveBeenCalledWith({
        where: {
          id: "apt-1",
          building: {
            administratorId: tenantContext.administratorId,
          },
        },
        include: expect.any(Object),
      });
    });

    it("should apply owner tenant context", async () => {
      const tenantContext = createMockOwnerContext();

      const mockApartment = {
        ...createMockApartment("building-1", tenantContext.ownerId!),
        building: {
          ...createMockBuilding("admin-1"),
        },
        _count: {
          waterReadings: 5,
        },
      };

      mockPrisma.apartment.findFirst.mockResolvedValue(mockApartment);

      await ApartmentService.getApartmentById("apt-1", tenantContext);

      expect(mockPrisma.apartment.findFirst).toHaveBeenCalledWith({
        where: {
          id: "apt-1",
          ownerId: tenantContext.ownerId,
        },
        include: expect.any(Object),
      });
    });
  });

  describe("createApartment", () => {
    it("should create apartment successfully", async () => {
      const tenantContext = createMockAdministratorContext();
      const mockBuilding = createMockBuilding(tenantContext.administratorId!);
      const mockCreatedApartment = createMockApartment(mockBuilding.id);

      const apartmentData: ApartmentInput = {
        number: mockCreatedApartment.number,
        floor: mockCreatedApartment.floor || 1,
        rooms: mockCreatedApartment.rooms || 3,
        buildingId: mockBuilding.id,
      };

      mockPrisma.building.findFirst.mockResolvedValue(mockBuilding);
      mockPrisma.apartment.findFirst.mockResolvedValue(null); // No duplicate
      mockPrisma.apartment.create.mockResolvedValue(mockCreatedApartment);

      const result = await ApartmentService.createApartment(
        apartmentData,
        tenantContext
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedApartment);
      expect(mockPrisma.apartment.create).toHaveBeenCalledWith({
        data: apartmentData,
      });
    });

    it("should return error when building not found", async () => {
      const tenantContext = createMockAdministratorContext();

      const apartmentData: ApartmentInput = {
        number: "101",
        floor: 1,
        rooms: 3,
        buildingId: "nonexistent",
      };

      mockPrisma.building.findFirst.mockResolvedValue(null);

      const result = await ApartmentService.createApartment(
        apartmentData,
        tenantContext
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("NOT_FOUND");
    });

    it("should return error when apartment number already exists in building", async () => {
      const tenantContext = createMockAdministratorContext();
      const mockBuilding = createMockBuilding(tenantContext.administratorId!);
      const mockExistingApartment = createMockApartment(mockBuilding.id);

      const apartmentData: ApartmentInput = {
        number: mockExistingApartment.number,
        floor: 1,
        rooms: 3,
        buildingId: mockBuilding.id,
      };

      mockPrisma.building.findFirst.mockResolvedValue(mockBuilding);
      mockPrisma.apartment.findFirst.mockResolvedValue(mockExistingApartment); // Duplicate found

      const result = await ApartmentService.createApartment(
        apartmentData,
        tenantContext
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("DUPLICATE_ENTRY");
    });
  });

  describe("updateApartment", () => {
    it("should update apartment successfully", async () => {
      const tenantContext = createMockAdministratorContext();
      const mockApartment = createMockApartment("building-1");
      const mockUpdatedApartment = {
        ...mockApartment,
        rooms: 4,
      };

      const updateData = { rooms: 4 };

      mockPrisma.apartment.findFirst.mockResolvedValue(mockApartment);
      mockPrisma.apartment.update.mockResolvedValue(mockUpdatedApartment);

      const result = await ApartmentService.updateApartment(
        "apt-1",
        updateData,
        tenantContext
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedApartment);
      expect(mockPrisma.apartment.update).toHaveBeenCalledWith({
        where: { id: "apt-1" },
        data: updateData,
      });
    });

    it("should return error when apartment not found", async () => {
      const tenantContext = createMockAdministratorContext();
      const updateData = { rooms: 4 };

      mockPrisma.apartment.findFirst.mockResolvedValue(null);

      const result = await ApartmentService.updateApartment(
        "nonexistent",
        updateData,
        tenantContext
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("NOT_FOUND");
    });
  });

  describe("deleteApartment", () => {
    it("should delete apartment successfully", async () => {
      const tenantContext = createMockAdministratorContext();
      const mockApartment = createMockApartment("building-1");

      mockPrisma.apartment.findFirst.mockResolvedValue(mockApartment);
      mockPrisma.apartment.delete.mockResolvedValue(mockApartment);

      const result = await ApartmentService.deleteApartment(
        "apt-1",
        tenantContext
      );

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe("Apartamentul a fost șters cu succes");
      expect(mockPrisma.apartment.delete).toHaveBeenCalledWith({
        where: { id: "apt-1" },
      });
    });

    it("should return error when apartment not found", async () => {
      const tenantContext = createMockAdministratorContext();

      mockPrisma.apartment.findFirst.mockResolvedValue(null);

      const result = await ApartmentService.deleteApartment(
        "nonexistent",
        tenantContext
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("NOT_FOUND");
    });
  });

  describe("getApartmentsByBuilding", () => {
    it("should get apartments by building ID", async () => {
      const mockBuilding = createMockBuilding("admin-1");
      const mockApartments = [
        {
          ...createMockApartment(mockBuilding.id, "owner-1"),
          _count: {
            waterReadings: 5,
          },
        },
      ];

      // Mock building access check
      mockPrisma.building.findFirst.mockResolvedValue(mockBuilding);
      mockPrisma.apartment.findMany.mockResolvedValue(mockApartments);

      const result = await ApartmentService.getApartmentsByBuilding(
        mockBuilding.id
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApartments);
      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith({
        where: { buildingId: mockBuilding.id },
        include: expect.any(Object),
        orderBy: { number: "asc" },
      });
    });

    it("should apply administrator tenant context", async () => {
      const tenantContext = createMockAdministratorContext();
      const mockBuilding = createMockBuilding(tenantContext.administratorId!);
      const mockApartments = [
        {
          ...createMockApartment(mockBuilding.id, "owner-1"),
          _count: {
            waterReadings: 5,
          },
        },
      ];

      // Mock building access check with tenant context
      mockPrisma.building.findFirst.mockResolvedValue(mockBuilding);
      mockPrisma.apartment.findMany.mockResolvedValue(mockApartments);

      const result = await ApartmentService.getApartmentsByBuilding(
        mockBuilding.id,
        tenantContext
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApartments);

      // Check that building access was verified with tenant context
      expect(mockPrisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockBuilding.id,
          administratorId: tenantContext.administratorId,
        },
      });

      // Check that apartments were fetched
      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith({
        where: { buildingId: mockBuilding.id },
        include: expect.any(Object),
        orderBy: { number: "asc" },
      });
    });

    it("should return error when building not found", async () => {
      // Mock building access check to return null
      mockPrisma.building.findFirst.mockResolvedValue(null);

      const result = await ApartmentService.getApartmentsByBuilding(
        "nonexistent"
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe("NOT_FOUND");
    });
  });
});
