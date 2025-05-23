import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Mock Prisma Client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    administrator: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    building: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    apartment: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    waterReading: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("Database Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Operations", () => {
    it("should create a new user", async () => {
      const userData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        password: "hashedpassword",
        firstName: "John",
        lastName: "Doe",
        role: "ADMINISTRATOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.create.mockResolvedValue(userData as any);

      const result = await mockPrisma.user.create({
        data: {
          email: "test@example.com",
          password: "hashedpassword",
          firstName: "John",
          lastName: "Doe",
          role: "ADMINISTRATOR",
        },
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          password: "hashedpassword",
          firstName: "John",
          lastName: "Doe",
          role: "ADMINISTRATOR",
        },
      });
      expect(result).toEqual(userData);
    });

    it("should find user by email", async () => {
      const userData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "ADMINISTRATOR",
      };

      mockPrisma.user.findUnique.mockResolvedValue(userData as any);

      const result = await mockPrisma.user.findUnique({
        where: { email: "test@example.com" },
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
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
      const buildingData = {
        id: "123e4567-e89b-12d3-a456-426614174001",
        name: "Test Building",
        address: "123 Test Street",
        city: "Test City",
        administratorId: "123e4567-e89b-12d3-a456-426614174000",
        readingDeadline: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.building.create.mockResolvedValue(buildingData as any);

      const result = await mockPrisma.building.create({
        data: {
          name: "Test Building",
          address: "123 Test Street",
          city: "Test City",
          administratorId: "123e4567-e89b-12d3-a456-426614174000",
          readingDeadline: 25,
        },
      });

      expect(mockPrisma.building.create).toHaveBeenCalledWith({
        data: {
          name: "Test Building",
          address: "123 Test Street",
          city: "Test City",
          administratorId: "123e4567-e89b-12d3-a456-426614174000",
          readingDeadline: 25,
        },
      });
      expect(result).toEqual(buildingData);
    });

    it("should find buildings by administrator", async () => {
      const buildingsData = [
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          name: "Building 1",
          administratorId: "123e4567-e89b-12d3-a456-426614174000",
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          name: "Building 2",
          administratorId: "123e4567-e89b-12d3-a456-426614174000",
        },
      ];

      mockPrisma.building.findMany.mockResolvedValue(buildingsData as any);

      const result = await mockPrisma.building.findMany({
        where: { administratorId: "123e4567-e89b-12d3-a456-426614174000" },
      });

      expect(mockPrisma.building.findMany).toHaveBeenCalledWith({
        where: { administratorId: "123e4567-e89b-12d3-a456-426614174000" },
      });
      expect(result).toEqual(buildingsData);
      expect(result).toHaveLength(2);
    });
  });

  describe("Water Reading Operations", () => {
    it("should create a new water reading", async () => {
      const readingData = {
        id: "123e4567-e89b-12d3-a456-426614174003",
        apartmentId: "123e4567-e89b-12d3-a456-426614174002",
        day: 15,
        month: 6,
        year: 2024,
        reading: 1250.5,
        submittedBy: "123e4567-e89b-12d3-a456-426614174000",
        submittedAt: new Date(),
        isValidated: false,
      };

      mockPrisma.waterReading.create.mockResolvedValue(readingData as any);

      const result = await mockPrisma.waterReading.create({
        data: {
          apartmentId: "123e4567-e89b-12d3-a456-426614174002",
          day: 15,
          month: 6,
          year: 2024,
          reading: 1250.5,
          submittedBy: "123e4567-e89b-12d3-a456-426614174000",
        },
      });

      expect(mockPrisma.waterReading.create).toHaveBeenCalledWith({
        data: {
          apartmentId: "123e4567-e89b-12d3-a456-426614174002",
          day: 15,
          month: 6,
          year: 2024,
          reading: 1250.5,
          submittedBy: "123e4567-e89b-12d3-a456-426614174000",
        },
      });
      expect(result).toEqual(readingData);
    });

    it("should find water readings for apartment", async () => {
      const readingsData = [
        {
          id: "123e4567-e89b-12d3-a456-426614174003",
          apartmentId: "123e4567-e89b-12d3-a456-426614174002",
          month: 5,
          year: 2024,
          reading: 1225.0,
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174004",
          apartmentId: "123e4567-e89b-12d3-a456-426614174002",
          month: 6,
          year: 2024,
          reading: 1250.5,
        },
      ];

      mockPrisma.waterReading.findMany.mockResolvedValue(readingsData as any);

      const result = await mockPrisma.waterReading.findMany({
        where: {
          apartmentId: "123e4567-e89b-12d3-a456-426614174002",
          year: 2024,
        },
        orderBy: { month: "asc" },
      });

      expect(mockPrisma.waterReading.findMany).toHaveBeenCalledWith({
        where: {
          apartmentId: "123e4567-e89b-12d3-a456-426614174002",
          year: 2024,
        },
        orderBy: { month: "asc" },
      });
      expect(result).toEqual(readingsData);
      expect(result).toHaveLength(2);
    });
  });
});
