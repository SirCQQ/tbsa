import { faker } from "@faker-js/faker";
import { TenantContext } from "../../src/services/tenant.service";
import type {
  Building,
  Apartment,
  WaterReading,
  User,
  Administrator,
  Owner,
} from "@prisma/client/wasm";

// Tenant Context Factories
export const createMockAdministratorContext = (): TenantContext => ({
  userId: faker.string.uuid(),
  role: "ADMINISTRATOR",
  administratorId: faker.string.uuid(),
  email: faker.internet.email(),
});

export const createMockOwnerContext = (): TenantContext => ({
  userId: faker.string.uuid(),
  role: "OWNER",
  ownerId: faker.string.uuid(),
  email: faker.internet.email(),
});

// Building Factories
export const createMockBuilding = (
  administratorId: string
): Building & {
  administrator: Administrator & {
    user: Pick<User, "firstName" | "lastName" | "email">;
  };
  apartments: Apartment[];
} => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  postalCode: faker.location.zipCode(),
  administratorId,
  readingDeadline: faker.number.int({ min: 1, max: 31 }),

  // Extended building information
  type: "RESIDENTIAL" as const,
  floors: faker.number.int({ min: 1, max: 20 }),
  totalApartments: faker.number.int({ min: 10, max: 100 }),
  yearBuilt: faker.number.int({ min: 1950, max: 2024 }),
  description: faker.lorem.sentence(),
  hasElevator: faker.datatype.boolean(),
  hasParking: faker.datatype.boolean(),
  hasGarden: faker.datatype.boolean(),

  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  administrator: {
    id: administratorId,
    userId: faker.string.uuid(),
    user: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
    },
  },
  apartments: [],
});

export const createMockBuildingRequest = () => ({
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  postalCode: faker.location.zipCode(),
  readingDeadline: faker.number.int({ min: 1, max: 31 }),
});

export const createMockBuildingRequestPartial = (): Partial<{
  name: string;
  address: string;
  city: string;
  postalCode: string;
  readingDeadline?: number;
}> => ({
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  postalCode: faker.location.zipCode(),
  // readingDeadline is optional and sometimes omitted
});

// Apartment Factories
export const createMockApartment = (
  buildingId: string,
  ownerId?: string
): Apartment & {
  building: Pick<Building, "id" | "name" | "administratorId">;
  owner?: Owner & { user: Pick<User, "firstName" | "lastName" | "email"> };
} => ({
  id: faker.string.uuid(),
  number: faker.number.int({ min: 1, max: 100 }).toString(),
  floor: faker.number.int({ min: 0, max: 10 }),
  rooms: faker.number.int({ min: 1, max: 5 }),
  buildingId,
  ownerId: ownerId || null,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  building: {
    id: buildingId,
    name: faker.company.name(),
    administratorId: faker.string.uuid(),
  },
  owner: ownerId
    ? {
        id: ownerId,
        userId: faker.string.uuid(),
        user: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
        },
      }
    : undefined,
});

// Water Reading Factories
export const createMockWaterReading = (
  apartmentId: string,
  submittedBy: string
): WaterReading => ({
  id: faker.string.uuid(),
  apartmentId,
  day: faker.number.int({ min: 1, max: 31 }),
  month: faker.number.int({ min: 1, max: 12 }),
  year: faker.number.int({ min: 2020, max: 2024 }),
  reading: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
  consumption: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
  submittedBy,
  submittedAt: faker.date.recent(),
  isValidated: faker.datatype.boolean(),
  validatedBy: faker.datatype.boolean() ? faker.string.uuid() : null,
  validatedAt: faker.datatype.boolean() ? faker.date.recent() : null,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

// User Factories
export const createMockUser = (
  role: "ADMINISTRATOR" | "OWNER" = "OWNER"
): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phone: faker.phone.number(),
  role,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const createMockAdministrator = (userId?: string): Administrator => ({
  id: faker.string.uuid(),
  userId: userId || faker.string.uuid(),
});

export const createMockOwner = (userId?: string): Owner => ({
  id: faker.string.uuid(),
  userId: userId || faker.string.uuid(),
});

// Auth Service Prisma Result Factories
export const createMockGetCurrentUserPrismaResult = (
  role: "ADMINISTRATOR" | "OWNER" = "OWNER",
  userId?: string
) => {
  const user = createMockUser(role);
  if (userId) {
    user.id = userId;
  }

  //@ts-expect-error - we don't want to test the password
  delete user.password;
  //@ts-expect-error - we don't want to test the updatedAt
  delete user.updatedAt;

  const baseResult = {
    ...user,
    administrator: null as Administrator | null,
    owner: null as
      | (Owner & {
          apartments: (Apartment & {
            building: Pick<Building, "id" | "name" | "readingDeadline">;
          })[];
        })
      | null,
  };

  if (role === "ADMINISTRATOR") {
    baseResult.administrator = createMockAdministrator(user.id);
  } else if (role === "OWNER") {
    const owner = createMockOwner(user.id);
    const buildingId = faker.string.uuid();

    // Create apartments with building info for owner
    const apartments = Array.from(
      { length: faker.number.int({ min: 1, max: 3 }) },
      () => ({
        id: faker.string.uuid(),
        number: faker.number.int({ min: 1, max: 100 }).toString(),
        floor: faker.number.int({ min: 0, max: 10 }),
        rooms: faker.number.int({ min: 1, max: 5 }),
        buildingId,
        ownerId: owner.id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        building: {
          id: buildingId,
          name: faker.company.name(),
          readingDeadline: faker.number.int({ min: 1, max: 31 }),
        },
      })
    );

    baseResult.owner = {
      ...owner,
      apartments,
    };
  }

  return baseResult;
};

// Complex object factories for testing relationships
export const createMockBuildingWithApartments = (
  administratorId: string,
  apartmentCount: number = 2
) => {
  const building = createMockBuilding(administratorId);
  const apartments = Array.from({ length: apartmentCount }, () =>
    createMockApartment(building.id, faker.string.uuid())
  );

  return {
    ...building,
    apartments,
  };
};

export const createMockApartmentWithReadings = (
  buildingId: string,
  ownerId: string,
  readingCount: number = 3
) => {
  const apartment = createMockApartment(buildingId, ownerId);
  const readings = Array.from({ length: readingCount }, () =>
    createMockWaterReading(apartment.id, ownerId)
  );

  return {
    apartment,
    readings,
  };
};
