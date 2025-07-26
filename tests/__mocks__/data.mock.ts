import { faker } from "@faker-js/faker";
import type {
  Building,
  Apartment,
  WaterReading,
  User,
  Organization,
  ApartmentResident,
  WaterMeter,
  BuildingType,
  ApartmentRole,
  Prisma,
} from "@prisma/client";

// Context types based on actual schema structure
export type MockUserContext = {
  userId: string;
  email: string;
  organizationId: string;
  roleCode: string;
};

// Context Factories
export const createMockAdministratorContext = (): MockUserContext => ({
  userId: faker.string.uuid(),
  email: faker.internet.email(),
  organizationId: faker.string.uuid(),
  roleCode: "ADMINISTRATOR",
});

export const createMockOwnerContext = (): MockUserContext => ({
  userId: faker.string.uuid(),
  email: faker.internet.email(),
  organizationId: faker.string.uuid(),
  roleCode: "OWNER",
});

export const createMockResidentContext = (): MockUserContext => ({
  userId: faker.string.uuid(),
  email: faker.internet.email(),
  organizationId: faker.string.uuid(),
  roleCode: "RESIDENT",
});

// Organization Factories
export const createMockOrganization = (): Organization => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  code: faker.string.alpha({ length: 8, casing: "upper" }),
  description: faker.lorem.sentence(),
  address: faker.location.streetAddress(),
  subscriptionPlanId: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});

// Building Factories
export const createMockBuilding = (organizationId: string): Building => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  code: faker.string.alphanumeric({ length: 8, casing: "upper" }),
  address: faker.location.streetAddress(),
  type: faker.helpers.arrayElement<BuildingType>([
    "RESIDENTIAL",
    "COMMERCIAL",
    "MIXED",
  ]),
  floors: faker.number.int({ min: 1, max: 20 }),
  totalApartments: faker.number.int({ min: 10, max: 100 }),
  organizationId,
  description: faker.lorem.sentence(),
  readingDay: faker.number.int({ min: 1, max: 31 }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});

export const createMockBuildingWithOrganization = (organizationId?: string) => {
  const orgId = organizationId || faker.string.uuid();
  const building = createMockBuilding(orgId);
  const organization = createMockOrganization();
  organization.id = orgId;

  return {
    ...building,
    organization: {
      id: organization.id,
      name: organization.name,
      code: organization.code,
    },
  };
};

export const createMockBuildingRequest = () => ({
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  type: faker.helpers.arrayElement<BuildingType>([
    "RESIDENTIAL",
    "COMMERCIAL",
    "MIXED",
  ]),
  floors: faker.number.int({ min: 1, max: 20 }),
  totalApartments: faker.number.int({ min: 10, max: 100 }),
  description: faker.lorem.sentence(),
  readingDay: faker.number.int({ min: 1, max: 31 }),
  organizationId: faker.string.uuid(),
});

// Apartment Factories
export const createMockApartment = (buildingId: string): Apartment => ({
  id: faker.string.uuid(),
  number: faker.number.int({ min: 1, max: 100 }).toString(),
  floor: faker.number.int({ min: 0, max: 10 }),
  buildingId,
  isOccupied: faker.datatype.boolean(),
  occupantCount: faker.number.int({ min: 0, max: 6 }),
  surface: faker.number.float({ min: 30, max: 150, fractionDigits: 1 }),
  description: faker.lorem.sentence(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});

export const createMockApartmentWithBuilding = (
  buildingId?: string,
  organizationId?: string
) => {
  const bId = buildingId || faker.string.uuid();
  const apartment = createMockApartment(bId);

  return {
    ...apartment,
    building: {
      id: bId,
      name: faker.company.name(),
      code: faker.string.alphanumeric({ length: 8, casing: "upper" }),
      organizationId: organizationId || faker.string.uuid(),
    },
  };
};

// Apartment Resident Factories
export const createMockApartmentResident = (
  apartmentId: string,
  userId: string,
  role: ApartmentRole = "OWNER"
): ApartmentResident => ({
  id: faker.string.uuid(),
  apartmentId,
  userId,
  role,
  isActive: true,
  startDate: faker.date.past(),
  endDate: null,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});

// Water Meter Factories
export const createMockWaterMeter = (apartmentId: string): WaterMeter => ({
  id: faker.string.uuid(),
  serialNumber: faker.string.alphanumeric({ length: 10, casing: "upper" }),
  apartmentId,
  isActive: true,
  location: faker.helpers.arrayElement(["Kitchen", "Bathroom", "Utility Room"]),
  brand: faker.helpers.arrayElement(["Sensus", "Elster", "Kamstrup", "Itron"]),
  model: faker.string.alphanumeric({ length: 6, casing: "upper" }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});

// Water Reading Factories
export const createMockWaterReading = (
  waterMeterId: string,
  submittedById: string,
  approvedById?: string
): WaterReading => ({
  id: faker.string.uuid(),
  waterMeterId,
  value: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
  photo: faker.datatype.boolean() ? faker.image.url() : null,
  notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
  isApproved: !!approvedById,
  approvedById: approvedById || null,
  submittedById,
  readingDate: faker.date.recent(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});

// User Factories
export const createMockUser = (): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: faker.internet.password(),
  isActive: true,
  isVerified: faker.datatype.boolean(),
  emailVerified: faker.datatype.boolean() ? faker.date.recent() : null,
  image: faker.datatype.boolean() ? faker.image.avatar() : null,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});

export const createMockUserWithoutPassword = (): Omit<User, "password"> => {
  const user = createMockUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Complex object factories for testing relationships
export const createMockBuildingWithApartments = (
  organizationId: string,
  apartmentCount: number = 2
) => {
  const building = createMockBuilding(organizationId);
  const apartments = Array.from({ length: apartmentCount }, () =>
    createMockApartment(building.id)
  );

  return {
    ...building,
    apartments,
  };
};

export const createMockApartmentWithReadings = (
  buildingId: string,
  userId: string,
  readingCount: number = 3
) => {
  const apartment = createMockApartment(buildingId);
  const waterMeter = createMockWaterMeter(apartment.id);
  const readings = Array.from({ length: readingCount }, () =>
    createMockWaterReading(waterMeter.id, userId)
  );

  return {
    apartment: {
      ...apartment,
      waterMeters: [waterMeter],
    },
    readings,
  };
};

// User with organization context for testing multi-tenant scenarios
export const createMockUserWithOrganization = (organizationId?: string) => {
  const user = createMockUserWithoutPassword();
  const orgId = organizationId || faker.string.uuid();
  const organization = createMockOrganization();
  organization.id = orgId;

  return {
    ...user,
    organizations: [
      {
        id: faker.string.uuid(),
        userId: user.id,
        organizationId: orgId,
        permissionId: null,
        organization,
        permission: null,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    ],
  };
};

// Factory for building request validation
export const createMockBuildingRequestPartial = (): Partial<{
  name: string;
  address: string;
  type: BuildingType;
  floors: number;
  totalApartments: number;
  description: string;
  readingDay: number;
  organizationId: string;
}> => ({
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  type: faker.helpers.arrayElement<BuildingType>([
    "RESIDENTIAL",
    "COMMERCIAL",
    "MIXED",
  ]),
  floors: faker.number.int({ min: 1, max: 20 }),
  totalApartments: faker.number.int({ min: 10, max: 100 }),
  organizationId: faker.string.uuid(),
  // description and readingDay are optional and sometimes omitted
});

// Factory for apartment creation requests
export const createMockApartmentRequest = (buildingId?: string) => ({
  number: faker.number.int({ min: 1, max: 100 }).toString(),
  floor: faker.number.int({ min: 0, max: 10 }),
  buildingId: buildingId || faker.string.uuid(),
  surface: faker.number.float({ min: 30, max: 150, fractionDigits: 1 }),
  description: faker.lorem.sentence(),
});

// Factory for water meter creation requests
export const createMockWaterMeterRequest = (apartmentId?: string) => ({
  serialNumber: faker.string.alphanumeric({ length: 10, casing: "upper" }),
  apartmentId: apartmentId || faker.string.uuid(),
  location: faker.helpers.arrayElement(["Kitchen", "Bathroom", "Utility Room"]),
  brand: faker.helpers.arrayElement(["Sensus", "Elster", "Kamstrup", "Itron"]),
  model: faker.string.alphanumeric({ length: 6, casing: "upper" }),
});

// Factory for water reading submission requests
export const createMockWaterReadingRequest = (waterMeterId?: string) => ({
  waterMeterId: waterMeterId || faker.string.uuid(),
  value: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
  photo: faker.datatype.boolean() ? faker.image.url() : undefined,
  notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
});
