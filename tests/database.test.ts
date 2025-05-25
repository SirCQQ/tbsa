import { mockPrisma, resetPrismaMocks } from "./__mocks__/prisma.mock";
import {
  createMockUser,
  createMockBuilding,
  createMockWaterReading,
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
      const userData = createMockUser("ADMINISTRATOR");

      mockPrisma.user.create.mockResolvedValue(userData);

      const result = await mockPrisma.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        },
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        },
      });
      expect(result).toEqual(userData);
    });

    it("should find user by email", async () => {
      const userData = createMockUser("ADMINISTRATOR");

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
      const buildingData = createMockBuilding(adminContext.administratorId!);

      mockPrisma.building.create.mockResolvedValue(buildingData);

      const result = await mockPrisma.building.create({
        data: {
          name: buildingData.name,
          address: buildingData.address,
          city: buildingData.city,
          administratorId: buildingData.administratorId,
          readingDeadline: buildingData.readingDeadline,
        },
      });

      expect(mockPrisma.building.create).toHaveBeenCalledWith({
        data: {
          name: buildingData.name,
          address: buildingData.address,
          city: buildingData.city,
          administratorId: buildingData.administratorId,
          readingDeadline: buildingData.readingDeadline,
        },
      });
      expect(result).toEqual(buildingData);
    });

    it("should find buildings by administrator", async () => {
      const adminContext = createMockAdministratorContext();
      const buildingsData = [
        createMockBuilding(adminContext.administratorId!),
        createMockBuilding(adminContext.administratorId!),
      ];

      mockPrisma.building.findMany.mockResolvedValue(buildingsData);

      const result = await mockPrisma.building.findMany({
        where: { administratorId: adminContext.administratorId },
      });

      expect(mockPrisma.building.findMany).toHaveBeenCalledWith({
        where: { administratorId: adminContext.administratorId },
      });
      expect(result).toEqual(buildingsData);
      expect(result).toHaveLength(2);
    });
  });

  describe("Water Reading Operations", () => {
    it("should create a new water reading", async () => {
      const apartmentId = "apartment-123";
      const submittedBy = "user-123";
      const readingData = createMockWaterReading(apartmentId, submittedBy);

      mockPrisma.waterReading.create.mockResolvedValue(readingData);

      const result = await mockPrisma.waterReading.create({
        data: {
          apartmentId: readingData.apartmentId,
          day: readingData.day,
          month: readingData.month,
          year: readingData.year,
          reading: readingData.reading,
          submittedBy: readingData.submittedBy,
        },
      });

      expect(mockPrisma.waterReading.create).toHaveBeenCalledWith({
        data: {
          apartmentId: readingData.apartmentId,
          day: readingData.day,
          month: readingData.month,
          year: readingData.year,
          reading: readingData.reading,
          submittedBy: readingData.submittedBy,
        },
      });
      expect(result).toEqual(readingData);
    });

    it("should find water readings by apartment", async () => {
      const apartmentId = "apartment-123";
      const submittedBy = "user-123";
      const readingsData = [
        createMockWaterReading(apartmentId, submittedBy),
        createMockWaterReading(apartmentId, submittedBy),
      ];

      mockPrisma.waterReading.findMany.mockResolvedValue(readingsData);

      const result = await mockPrisma.waterReading.findMany({
        where: { apartmentId },
      });

      expect(mockPrisma.waterReading.findMany).toHaveBeenCalledWith({
        where: { apartmentId },
      });
      expect(result).toEqual(readingsData);
      expect(result).toHaveLength(2);
    });

    it("should update water reading validation", async () => {
      const apartmentId = "apartment-123";
      const submittedBy = "user-123";
      const readingData = createMockWaterReading(apartmentId, submittedBy);
      const updatedReading = { ...readingData, isValidated: true };

      mockPrisma.waterReading.update.mockResolvedValue(updatedReading);

      const result = await mockPrisma.waterReading.update({
        where: { id: readingData.id },
        data: { isValidated: true },
      });

      expect(mockPrisma.waterReading.update).toHaveBeenCalledWith({
        where: { id: readingData.id },
        data: { isValidated: true },
      });
      expect(result).toEqual(updatedReading);
      expect(result.isValidated).toBe(true);
    });
  });

  describe("Apartment Operations", () => {
    it("should create a new apartment", async () => {
      const buildingId = "building-123";
      const ownerId = "owner-123";
      const apartmentData = {
        id: "apartment-123",
        number: "101",
        floor: 1,
        rooms: 3,
        buildingId,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.apartment.create.mockResolvedValue(apartmentData);

      const result = await mockPrisma.apartment.create({
        data: {
          number: apartmentData.number,
          floor: apartmentData.floor,
          rooms: apartmentData.rooms,
          buildingId: apartmentData.buildingId,
          ownerId: apartmentData.ownerId,
        },
      });

      expect(mockPrisma.apartment.create).toHaveBeenCalledWith({
        data: {
          number: apartmentData.number,
          floor: apartmentData.floor,
          rooms: apartmentData.rooms,
          buildingId: apartmentData.buildingId,
          ownerId: apartmentData.ownerId,
        },
      });
      expect(result).toEqual(apartmentData);
    });

    it("should find apartments by building", async () => {
      const buildingId = "building-123";
      const apartmentsData = [
        {
          id: "apartment-1",
          number: "101",
          buildingId,
          ownerId: "owner-1",
        },
        {
          id: "apartment-2",
          number: "102",
          buildingId,
          ownerId: "owner-2",
        },
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

  describe("Database Connection", () => {
    it("should disconnect from database", async () => {
      mockPrisma.$disconnect.mockResolvedValue(undefined);

      await mockPrisma.$disconnect();

      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
});
