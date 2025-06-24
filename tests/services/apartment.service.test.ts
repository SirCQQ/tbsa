import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma.mock";
import { apartmentService } from "@/services/apartment.service";
import { faker } from "@faker-js/faker";
import type { Building, Apartment } from "@prisma/client";

// Mock data
const mockOrganizationId = faker.string.uuid();
const mockBuildingId = faker.string.uuid();

const mockBuilding: Building = {
  id: mockBuildingId,
  name: faker.company.name(),
  code: faker.string.alphanumeric(6).toUpperCase(),
  address: faker.location.streetAddress(),
  type: "RESIDENTIAL",
  floors: 5,
  totalApartments: 20,
  organizationId: mockOrganizationId,
  description: faker.lorem.sentence(),
  readingDay: 15,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockApartment: Apartment = {
  id: faker.string.uuid(),
  number: "101",
  floor: 1,
  buildingId: mockBuildingId,
  isOccupied: false,
  occupantCount: 2,
  surface: 85.5,
  description: faker.lorem.sentence(),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockCreateApartmentInput = {
  number: "102",
  floor: 1,
  buildingId: mockBuildingId,
  isOccupied: false,
  occupantCount: 3,
  surface: 90.0,
  description: "Two-bedroom apartment",
  organizationId: mockOrganizationId,
};

describe("ApartmentService", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  describe("createApartment", () => {
    it("should create apartment successfully", async () => {
      // Mock building exists
      mockPrisma.building.findFirst.mockResolvedValue(mockBuilding);

      // Mock no existing apartment
      mockPrisma.apartment.findFirst.mockResolvedValue(null);

      // Mock apartment creation
      const newApartment = { ...mockApartment, ...mockCreateApartmentInput };
      mockPrisma.apartment.create.mockResolvedValue(newApartment);

      const result = await apartmentService.createApartment(
        mockCreateApartmentInput
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(newApartment);
      expect(mockPrisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockBuildingId,
          organizationId: mockOrganizationId,
        },
      });
      expect(mockPrisma.apartment.create).toHaveBeenCalledWith({
        data: {
          number: mockCreateApartmentInput.number,
          floor: mockCreateApartmentInput.floor,
          buildingId: mockCreateApartmentInput.buildingId,
          isOccupied: mockCreateApartmentInput.isOccupied,
          occupantCount: mockCreateApartmentInput.occupantCount,
          surface: mockCreateApartmentInput.surface,
          description: mockCreateApartmentInput.description,
        },
      });
    });

    it("should fail if building not found", async () => {
      mockPrisma.building.findFirst.mockResolvedValue(null);

      const result = await apartmentService.createApartment(
        mockCreateApartmentInput
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Building not found or does not belong to your organization"
      );
      expect(mockPrisma.apartment.create).not.toHaveBeenCalled();
    });

    it("should fail if apartment number already exists", async () => {
      mockPrisma.building.findFirst.mockResolvedValue(mockBuilding);
      mockPrisma.apartment.findFirst.mockResolvedValue(mockApartment);

      const result = await apartmentService.createApartment(
        mockCreateApartmentInput
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "An apartment with this number already exists in this building"
      );
      expect(mockPrisma.apartment.create).not.toHaveBeenCalled();
    });

    it("should fail if floor exceeds building floors", async () => {
      const invalidInput = {
        ...mockCreateApartmentInput,
        floor: 10, // Building only has 5 floors
      };

      mockPrisma.building.findFirst.mockResolvedValue(mockBuilding);
      mockPrisma.apartment.findFirst.mockResolvedValue(null);

      const result = await apartmentService.createApartment(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        `Floor cannot exceed building's maximum floors (${mockBuilding.floors})`
      );
      expect(mockPrisma.apartment.create).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      mockPrisma.building.findFirst.mockRejectedValue(
        new Error("Database error")
      );

      const result = await apartmentService.createApartment(
        mockCreateApartmentInput
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create apartment");
    });
  });

  describe("getApartmentById", () => {
    const mockApartmentWithBuilding = {
      ...mockApartment,
      building: {
        id: mockBuildingId,
        name: mockBuilding.name,
        code: mockBuilding.code,
        organizationId: mockOrganizationId,
      },
    };

    it("should get apartment by ID successfully", async () => {
      mockPrisma.apartment.findFirst.mockResolvedValue(
        mockApartmentWithBuilding
      );

      const result = await apartmentService.getApartmentById(
        mockApartment.id,
        mockOrganizationId
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApartmentWithBuilding);
      expect(mockPrisma.apartment.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockApartment.id,
          building: {
            organizationId: mockOrganizationId,
          },
        },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              code: true,
              organizationId: true,
            },
          },
        },
      });
    });

    it("should fail if apartment not found", async () => {
      mockPrisma.apartment.findFirst.mockResolvedValue(null);

      const result = await apartmentService.getApartmentById(
        "non-existent-id",
        mockOrganizationId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Apartment not found");
    });

    it("should handle database errors gracefully", async () => {
      mockPrisma.apartment.findFirst.mockRejectedValue(
        new Error("Database error")
      );

      const result = await apartmentService.getApartmentById(
        mockApartment.id,
        mockOrganizationId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to fetch apartment");
    });
  });

  describe("getApartmentsByBuilding", () => {
    const mockApartmentsWithCounts = [
      {
        ...mockApartment,
        building: {
          id: mockBuildingId,
          name: mockBuilding.name,
          code: mockBuilding.code,
        },
        _count: {
          apartmentResidents: 1,
          waterMeters: 1,
        },
      },
    ];

    it("should get apartments by building successfully", async () => {
      mockPrisma.building.findFirst.mockResolvedValue(mockBuilding);
      mockPrisma.apartment.findMany.mockResolvedValue(mockApartmentsWithCounts);

      const result = await apartmentService.getApartmentsByBuilding(
        mockBuildingId,
        mockOrganizationId
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApartmentsWithCounts);
      expect(mockPrisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockBuildingId,
          organizationId: mockOrganizationId,
        },
      });
      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith({
        where: {
          buildingId: mockBuildingId,
        },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              apartmentResidents: true,
              waterMeters: true,
            },
          },
        },
        orderBy: [{ floor: "asc" }, { number: "asc" }],
      });
    });

    it("should fail if building not found", async () => {
      mockPrisma.building.findFirst.mockResolvedValue(null);

      const result = await apartmentService.getApartmentsByBuilding(
        "non-existent-id",
        mockOrganizationId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Building not found or does not belong to your organization"
      );
      expect(mockPrisma.apartment.findMany).not.toHaveBeenCalled();
    });
  });

  describe("getApartmentsByOrganization", () => {
    const mockApartmentsWithCounts = [
      {
        ...mockApartment,
        building: {
          id: mockBuildingId,
          name: mockBuilding.name,
          code: mockBuilding.code,
        },
        _count: {
          apartmentResidents: 0,
          waterMeters: 0,
        },
      },
    ];

    it("should get apartments by organization successfully", async () => {
      mockPrisma.apartment.findMany.mockResolvedValue(mockApartmentsWithCounts);

      const result =
        await apartmentService.getApartmentsByOrganization(mockOrganizationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApartmentsWithCounts);
      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith({
        where: {
          building: {
            organizationId: mockOrganizationId,
          },
        },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              apartmentResidents: true,
              waterMeters: true,
            },
          },
        },
        orderBy: [
          { building: { name: "asc" } },
          { floor: "asc" },
          { number: "asc" },
        ],
      });
    });

    it("should handle database errors gracefully", async () => {
      mockPrisma.apartment.findMany.mockRejectedValue(
        new Error("Database error")
      );

      const result =
        await apartmentService.getApartmentsByOrganization(mockOrganizationId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to fetch apartments");
    });
  });

  describe("deleteApartment", () => {
    const mockApartmentWithBuilding = {
      ...mockApartment,
      building: {
        id: mockBuildingId,
        name: mockBuilding.name,
        code: mockBuilding.code,
        organizationId: mockOrganizationId,
      },
    };

    const mockApartmentDetails = {
      ...mockApartment,
      _count: {
        apartmentResidents: 0,
        waterMeters: 0,
      },
    };

    it("should delete apartment successfully", async () => {
      // Mock successful retrieval
      jest.spyOn(apartmentService, "getApartmentById").mockResolvedValue({
        success: true,
        data: mockApartmentWithBuilding,
      });

      mockPrisma.apartment.findUnique.mockResolvedValue(mockApartmentDetails);
      mockPrisma.apartment.update.mockResolvedValue(mockApartment);

      const result = await apartmentService.deleteApartment(
        mockApartment.id,
        mockOrganizationId
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.apartment.update).toHaveBeenCalledWith({
        where: { id: mockApartment.id },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it("should fail if apartment has residents", async () => {
      jest.spyOn(apartmentService, "getApartmentById").mockResolvedValue({
        success: true,
        data: mockApartmentWithBuilding,
      });

      const apartmentWithResidents = {
        ...mockApartmentDetails,
        _count: { apartmentResidents: 1, waterMeters: 0 },
      };
      mockPrisma.apartment.findUnique.mockResolvedValue(apartmentWithResidents);

      const result = await apartmentService.deleteApartment(
        mockApartment.id,
        mockOrganizationId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Cannot delete apartment with existing residents"
      );
      expect(mockPrisma.apartment.update).not.toHaveBeenCalled();
    });

    it("should fail if apartment has water meters", async () => {
      jest.spyOn(apartmentService, "getApartmentById").mockResolvedValue({
        success: true,
        data: mockApartmentWithBuilding,
      });

      const apartmentWithMeters = {
        ...mockApartmentDetails,
        _count: { apartmentResidents: 0, waterMeters: 1 },
      };
      mockPrisma.apartment.findUnique.mockResolvedValue(apartmentWithMeters);

      const result = await apartmentService.deleteApartment(
        mockApartment.id,
        mockOrganizationId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Cannot delete apartment with existing water meters"
      );
      expect(mockPrisma.apartment.update).not.toHaveBeenCalled();
    });

    it("should fail if apartment not found", async () => {
      jest.spyOn(apartmentService, "getApartmentById").mockResolvedValue({
        success: false,
        error: "Apartment not found",
      });

      const result = await apartmentService.deleteApartment(
        "non-existent-id",
        mockOrganizationId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Apartment not found");
      expect(mockPrisma.apartment.update).not.toHaveBeenCalled();
    });
  });
});
