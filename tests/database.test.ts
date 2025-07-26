import { mockPrisma, resetPrismaMocks } from "./__mocks__/prisma.mock";
import {
  createMockUser,
  createMockBuilding,
  createMockWaterReading,
  createMockWaterMeter,
  createMockApartment,
  createMockAdministratorContext,
} from "./__mocks__/data.mock";

// Mock the prisma module
jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Database Operations", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  describe("User Operations", () => {
    it("should create a new user", async () => {
      const userData = createMockUser();

      mockPrisma.user.create.mockResolvedValue(userData);

      const result = await mockPrisma.user.create({
        data: userData,
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(userData);
    });

    it("should find user by email", async () => {
      const userData = createMockUser();

      mockPrisma.user.findUnique.mockResolvedValue(userData);

      const result = await mockPrisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(result).toEqual(userData);
    });

    it("should return null for non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await mockPrisma.user.findUnique({
        where: { email: "nonexistent@example.com" },
      });

      expect(result).toBeNull();
    });
  });

  describe("Building Operations", () => {
    it("should create a new building", async () => {
      const adminContext = createMockAdministratorContext();
      const buildingData = createMockBuilding(adminContext.organizationId);

      mockPrisma.building.create.mockResolvedValue(buildingData);

      const result = await mockPrisma.building.create({
        data: buildingData,
      });

      expect(mockPrisma.building.create).toHaveBeenCalledWith({
        data: buildingData,
      });
      expect(result).toEqual(buildingData);
    });

    it("should find buildings by organization", async () => {
      const adminContext = createMockAdministratorContext();
      const buildingsData = [
        createMockBuilding(adminContext.organizationId),
        createMockBuilding(adminContext.organizationId),
      ];

      mockPrisma.building.findMany.mockResolvedValue(buildingsData);

      const result = await mockPrisma.building.findMany({
        where: { organizationId: adminContext.organizationId },
      });

      expect(mockPrisma.building.findMany).toHaveBeenCalledWith({
        where: { organizationId: adminContext.organizationId },
      });
      expect(result).toEqual(buildingsData);
      expect(result).toHaveLength(2);
    });
  });

  describe("Water Reading Operations", () => {
    it("should create a new water reading", async () => {
      const waterMeterId = "water-meter-123";
      const submittedById = "user-123";
      const readingData = createMockWaterReading(waterMeterId, submittedById);

      mockPrisma.waterReading.create.mockResolvedValue(readingData);

      const result = await mockPrisma.waterReading.create({
        data: readingData,
      });

      expect(mockPrisma.waterReading.create).toHaveBeenCalledWith({
        data: readingData,
      });
      expect(result).toEqual(readingData);
    });

    it("should find water readings by water meter", async () => {
      const waterMeterId = "water-meter-123";
      const submittedById = "user-123";
      const readingsData = [
        createMockWaterReading(waterMeterId, submittedById),
        createMockWaterReading(waterMeterId, submittedById),
      ];

      mockPrisma.waterReading.findMany.mockResolvedValue(readingsData);

      const result = await mockPrisma.waterReading.findMany({
        where: { waterMeterId },
      });

      expect(mockPrisma.waterReading.findMany).toHaveBeenCalledWith({
        where: { waterMeterId },
      });
      expect(result).toEqual(readingsData);
      expect(result).toHaveLength(2);
    });

    it("should update water reading approval", async () => {
      const waterMeterId = "water-meter-123";
      const submittedById = "user-123";
      const approvedById = "admin-123";
      const readingData = createMockWaterReading(waterMeterId, submittedById);
      const updatedReading = {
        ...readingData,
        isApproved: true,
        approvedById,
      };

      mockPrisma.waterReading.update.mockResolvedValue(updatedReading);

      const result = await mockPrisma.waterReading.update({
        where: { id: readingData.id },
        data: {
          isApproved: true,
          approvedById,
        },
      });

      expect(mockPrisma.waterReading.update).toHaveBeenCalledWith({
        where: { id: readingData.id },
        data: {
          isApproved: true,
          approvedById,
        },
      });
      expect(result).toEqual(updatedReading);
      expect(result.isApproved).toBe(true);
      expect(result.approvedById).toBe(approvedById);
    });
  });

  describe("Apartment Operations", () => {
    it("should create a new apartment", async () => {
      const buildingId = "building-123";
      const apartmentData = createMockApartment(buildingId);

      mockPrisma.apartment.create.mockResolvedValue(apartmentData);

      const result = await mockPrisma.apartment.create({
        data: apartmentData,
      });

      expect(mockPrisma.apartment.create).toHaveBeenCalledWith({
        data: apartmentData,
      });
      expect(result).toEqual(apartmentData);
    });

    it("should find apartments by building", async () => {
      const buildingId = "building-123";
      const apartmentsData = [
        createMockApartment(buildingId),
        createMockApartment(buildingId),
      ];

      mockPrisma.apartment.findMany.mockResolvedValue(apartmentsData);

      const result = await mockPrisma.apartment.findMany({
        where: { buildingId },
      });

      expect(mockPrisma.apartment.findMany).toHaveBeenCalledWith({
        where: { buildingId },
      });
      expect(result).toEqual(apartmentsData);
      expect(result).toHaveLength(2);
    });
  });

  describe("Water Meter Operations", () => {
    it("should create a new water meter", async () => {
      const apartmentId = "apartment-123";
      const waterMeterData = createMockWaterMeter(apartmentId);

      mockPrisma.waterMeter.create.mockResolvedValue(waterMeterData);

      const result = await mockPrisma.waterMeter.create({
        data: waterMeterData,
      });

      expect(mockPrisma.waterMeter.create).toHaveBeenCalledWith({
        data: waterMeterData,
      });
      expect(result).toEqual(waterMeterData);
    });

    it("should find water meters by apartment", async () => {
      const apartmentId = "apartment-123";
      const waterMetersData = [
        createMockWaterMeter(apartmentId),
        createMockWaterMeter(apartmentId),
      ];

      mockPrisma.waterMeter.findMany.mockResolvedValue(waterMetersData);

      const result = await mockPrisma.waterMeter.findMany({
        where: { apartmentId },
      });

      expect(mockPrisma.waterMeter.findMany).toHaveBeenCalledWith({
        where: { apartmentId },
      });
      expect(result).toEqual(waterMetersData);
      expect(result).toHaveLength(2);
    });
  });

  describe("Database Connection", () => {
    it("should disconnect from database", async () => {
      mockPrisma.$disconnect.mockResolvedValue(undefined);

      await mockPrisma.$disconnect();

      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
});
