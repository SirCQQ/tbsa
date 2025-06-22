/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock types for Prisma operations
export type MockPrismaBuilding = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  findFirst: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
  count: jest.MockedFunction<any>;
  aggregate: jest.MockedFunction<any>;
};

export type MockPrismaApartment = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  findFirst: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
  count: jest.MockedFunction<any>;
  aggregate: jest.MockedFunction<any>;
};

export type MockPrismaWaterReading = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  findFirst: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
  count: jest.MockedFunction<any>;
  aggregate: jest.MockedFunction<any>;
};

export type MockPrismaUser = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  findFirst: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
  count: jest.MockedFunction<any>;
  aggregate: jest.MockedFunction<any>;
};

export type MockPrismaAdministrator = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  findFirst: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
  count: jest.MockedFunction<any>;
  aggregate: jest.MockedFunction<any>;
};

export type MockPrismaOwner = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  findFirst: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
  count: jest.MockedFunction<any>;
  aggregate: jest.MockedFunction<any>;
};

export type MockPrismaSession = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  findFirst: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
  deleteMany: jest.MockedFunction<any>;
  count: jest.MockedFunction<any>;
  aggregate: jest.MockedFunction<any>;
};

export type MockPrismaOrganization = {
  findMany: jest.MockedFunction<any>;
  findUnique: jest.MockedFunction<any>;
  findFirst: jest.MockedFunction<any>;
  create: jest.MockedFunction<any>;
  update: jest.MockedFunction<any>;
  delete: jest.MockedFunction<any>;
  count: jest.MockedFunction<any>;
  aggregate: jest.MockedFunction<any>;
};

export type MockPrisma = {
  building: MockPrismaBuilding;
  apartment: MockPrismaApartment;
  waterReading: MockPrismaWaterReading;
  user: MockPrismaUser;
  administrator: MockPrismaAdministrator;
  owner: MockPrismaOwner;
  session: MockPrismaSession;
  organization: MockPrismaOrganization;
  $transaction: jest.MockedFunction<any>;
  $connect: jest.MockedFunction<any>;
  $disconnect: jest.MockedFunction<any>;
};

// Create the mock Prisma instance
export const createMockPrisma = (): MockPrisma => ({
  building: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  apartment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  waterReading: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  administrator: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  owner: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  session: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  organization: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
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
