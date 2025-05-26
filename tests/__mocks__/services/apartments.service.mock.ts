import { faker } from "@faker-js/faker";

// Mock apartment types based on Prisma schema
type MockApartment = {
  id: string;
  number: string;
  floor: number | null;
  rooms: number | null;
  buildingId: string;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type MockApartmentWithBuilding = MockApartment & {
  building: {
    id: string;
    name: string;
    address: string;
    administratorId: string;
  };
};

type MockApartmentWithOwner = MockApartment & {
  owner: {
    id: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  } | null;
};

type MockApartmentWithRelations = MockApartment & {
  building: {
    id: string;
    name: string;
    address: string;
    administratorId: string;
  };
  owner: {
    id: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  } | null;
  waterReadings: MockWaterReading[];
  _count: {
    waterReadings: number;
  };
};

type MockWaterReading = {
  id: string;
  apartmentId: string;
  day: number;
  month: number;
  year: number;
  reading: number;
  consumption: number | null;
  submittedAt: Date;
  submittedBy: string;
  isValidated: boolean;
  validatedAt: Date | null;
  validatedBy: string | null;
};

// Mock apartment data factories
export const createMockApartment = (
  overrides?: Partial<MockApartment>
): MockApartment => ({
  id: faker.string.uuid(),
  number: faker.number.int({ min: 1, max: 100 }).toString(),
  floor:
    faker.helpers.maybe(() => faker.number.int({ min: 0, max: 10 }), {
      probability: 0.9,
    }) ?? null,
  rooms:
    faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 }), {
      probability: 0.8,
    }) ?? null,
  buildingId: faker.string.uuid(),
  ownerId:
    faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.8 }) ??
    null,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockApartmentWithBuilding = (
  overrides?: Partial<MockApartment>
): MockApartmentWithBuilding => ({
  ...createMockApartment(overrides),
  building: {
    id: faker.string.uuid(),
    name: `Bloc ${faker.location.buildingNumber()}`,
    address: faker.location.streetAddress(),
    administratorId: faker.string.uuid(),
  },
});

export const createMockApartmentWithOwner = (
  hasOwner: boolean = true,
  overrides?: Partial<MockApartment>
): MockApartmentWithOwner => ({
  ...createMockApartment(overrides),
  owner: hasOwner
    ? {
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        user: {
          id: faker.string.uuid(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      }
    : null,
});

export const createMockWaterReading = (
  overrides?: Partial<MockWaterReading>
): MockWaterReading => ({
  id: faker.string.uuid(),
  apartmentId: faker.string.uuid(),
  day: faker.number.int({ min: 1, max: 31 }),
  month: faker.number.int({ min: 1, max: 12 }),
  year: faker.number.int({ min: 2020, max: 2024 }),
  reading: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
  consumption:
    faker.helpers.maybe(
      () => faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
      { probability: 0.8 }
    ) ?? null,
  submittedAt: faker.date.recent(),
  submittedBy: faker.string.uuid(),
  isValidated: faker.datatype.boolean(),
  validatedAt:
    faker.helpers.maybe(() => faker.date.recent(), { probability: 0.6 }) ??
    null,
  validatedBy:
    faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.6 }) ??
    null,
  ...overrides,
});

export const createMockApartmentWithRelations = (
  waterReadingCount: number = 3,
  hasOwner: boolean = true,
  overrides?: Partial<MockApartment>
): MockApartmentWithRelations => {
  const apartment = createMockApartment(overrides);
  const waterReadings = Array.from({ length: waterReadingCount }, () =>
    createMockWaterReading({ apartmentId: apartment.id })
  );

  return {
    ...apartment,
    building: {
      id: apartment.buildingId,
      name: `Bloc ${faker.location.buildingNumber()}`,
      address: faker.location.streetAddress(),
      administratorId: faker.string.uuid(),
    },
    owner: hasOwner
      ? {
          id: faker.string.uuid(),
          userId: faker.string.uuid(),
          user: {
            id: faker.string.uuid(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
          },
        }
      : null,
    waterReadings,
    _count: {
      waterReadings: waterReadingCount,
    },
  };
};

// Mock apartment creation data
export const createMockApartmentCreateData = () => ({
  number: faker.number.int({ min: 1, max: 100 }).toString(),
  floor: faker.number.int({ min: 0, max: 10 }),
  rooms: faker.number.int({ min: 1, max: 5 }),
  buildingId: faker.string.uuid(),
  ownerId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.8 }),
});

// Mock apartment update data
export const createMockApartmentUpdateData = () => ({
  number: faker.number.int({ min: 1, max: 100 }).toString(),
  floor: faker.number.int({ min: 0, max: 10 }),
  rooms: faker.number.int({ min: 1, max: 5 }),
  ownerId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.8 }),
});

// Mock multiple apartments
export const createMockApartments = (count: number = 5): MockApartment[] => {
  return Array.from({ length: count }, () => createMockApartment());
};

// Mock apartment statistics
export const createMockApartmentStats = () => ({
  total: faker.number.int({ min: 10, max: 100 }),
  occupied: faker.number.int({ min: 5, max: 80 }),
  vacant: faker.number.int({ min: 0, max: 20 }),
  withReadings: faker.number.int({ min: 5, max: 70 }),
  withoutReadings: faker.number.int({ min: 0, max: 30 }),
});

// Mock apartment validation errors
export const createMockApartmentValidationError = () => ({
  errors: [
    {
      code: "invalid_type",
      expected: "string",
      received: "undefined",
      path: ["number"],
      message: "Apartment number is required",
    },
    {
      code: "invalid_type",
      expected: "string",
      received: "undefined",
      path: ["buildingId"],
      message: "Building ID is required",
    },
  ],
});

// Mock apartment search results
export const createMockApartmentSearchResults = (
  query: string,
  count: number = 3
) => {
  return Array.from({ length: count }, () => ({
    ...createMockApartmentWithBuilding(),
    number: query,
  }));
};
