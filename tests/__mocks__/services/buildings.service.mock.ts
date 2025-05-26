import { faker } from "@faker-js/faker";

// Mock building types based on Prisma schema
type MockBuilding = {
  id: string;
  name: string;
  address: string;
  administratorId: string;
  createdAt: Date;
  updatedAt: Date;
};

type MockBuildingWithApartments = MockBuilding & {
  apartments: MockApartment[];
  _count: {
    apartments: number;
  };
};

type MockApartment = {
  id: string;
  number: string;
  floor: number;
  buildingId: string;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Mock building data factories
export const createMockBuilding = (
  overrides?: Partial<MockBuilding>
): MockBuilding => ({
  id: faker.string.uuid(),
  name: `Bloc ${faker.location.buildingNumber()}`,
  address: faker.location.streetAddress(),
  administratorId: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockApartment = (
  overrides?: Partial<MockApartment>
): MockApartment => ({
  id: faker.string.uuid(),
  number: faker.number.int({ min: 1, max: 100 }).toString(),
  floor: faker.number.int({ min: 0, max: 10 }),
  buildingId: faker.string.uuid(),
  ownerId:
    faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.8 }) ||
    null,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockBuildingWithApartments = (
  apartmentCount: number = 3,
  overrides?: Partial<MockBuilding>
): MockBuildingWithApartments => {
  const building = createMockBuilding(overrides);
  const apartments = Array.from({ length: apartmentCount }, () =>
    createMockApartment({ buildingId: building.id })
  );

  return {
    ...building,
    apartments,
    _count: {
      apartments: apartmentCount,
    },
  };
};

// Mock building creation data
export const createMockBuildingCreateData = () => ({
  name: `Bloc ${faker.location.buildingNumber()}`,
  address: faker.location.streetAddress(),
  administratorId: faker.string.uuid(),
});

// Mock building update data
export const createMockBuildingUpdateData = () => ({
  name: `Bloc ${faker.location.buildingNumber()} Updated`,
  address: faker.location.streetAddress(),
});

// Mock building with statistics
export const createMockBuildingWithStats = () => ({
  ...createMockBuilding(),
  _count: {
    apartments: faker.number.int({ min: 5, max: 50 }),
  },
  apartments: Array.from({ length: 3 }, () => createMockApartment()),
});

// Mock multiple buildings
export const createMockBuildings = (count: number = 5): MockBuilding[] => {
  return Array.from({ length: count }, () => createMockBuilding());
};

// Mock building search results
export const createMockBuildingSearchResults = (
  query: string,
  count: number = 3
) => {
  return Array.from({ length: count }, () => ({
    ...createMockBuilding(),
    name: `${query} ${faker.location.buildingNumber()}`,
  }));
};

// Mock building validation errors
export const createMockBuildingValidationError = () => ({
  errors: [
    {
      code: "invalid_type",
      expected: "string",
      received: "undefined",
      path: ["name"],
      message: "Name is required",
    },
    {
      code: "too_small",
      minimum: 1,
      type: "string",
      inclusive: true,
      exact: false,
      path: ["address"],
      message: "Address must be at least 1 character",
    },
  ],
});
