/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock types for Prisma operations
export type MockPrismaBuilding = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
};

export type MockPrismaApartment = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
};

export type MockPrismaWaterReading = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
};

export type MockPrismaUser = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
};

export type MockPrismaAdministrator = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
};

export type MockPrismaOwner = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
};

export type MockPrisma = {
  building: MockPrismaBuilding;
  apartment: MockPrismaApartment;
  waterReading: MockPrismaWaterReading;
  user: MockPrismaUser;
  administrator: MockPrismaAdministrator;
  owner: MockPrismaOwner;
  $transaction: jest.MockedFunction<any>;
  $connect: jest.MockedFunction<any>;
  $disconnect: jest.MockedFunction<any>;
};

// Create the mock Prisma instance
export const createMockPrisma = (): MockPrisma => ({
  building: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  apartment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  waterReading: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  administrator: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  owner: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

// Default mock instance
export const mockPrisma = createMockPrisma();

// Mock the prisma module
jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Helper function to reset all mocks
export const resetPrismaMocks = () => {
  Object.values(mockPrisma).forEach((model) => {
    if (typeof model === "object" && model !== null) {
      Object.values(model).forEach((method) => {
        if (jest.isMockFunction(method)) {
          method.mockReset();
        }
      });
    } else if (jest.isMockFunction(model)) {
      model.mockReset();
    }
  });
};
