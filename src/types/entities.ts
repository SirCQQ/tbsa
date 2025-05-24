import type {
  User,
  Administrator,
  Owner,
  Building,
  Apartment,
  WaterReading,
} from "@prisma/client/wasm";

// Re-export Prisma types directly
export type {
  User as UserEntity,
  Administrator as AdministratorEntity,
  Owner as OwnerEntity,
  Building as BuildingEntity,
  Apartment as ApartmentEntity,
  WaterReading as WaterReadingEntity,
  UserRole,
} from "@prisma/client/wasm";

// Extended types with relations for API responses
export type UserWithRelations = User & {
  administrator?: Administrator | null;
  owner?: Owner | null;
};

export type AdministratorWithRelations = Administrator & {
  user: User;
  buildings: Building[];
};

export type OwnerWithRelations = Owner & {
  user: User;
  apartments: (Apartment & {
    building: Building;
    waterReadings?: WaterReading[];
  })[];
};

export type BuildingWithRelations = Building & {
  administrator: Administrator & { user: User };
  apartments: (Apartment & {
    owner?: Owner & { user: User };
    waterReadings?: WaterReading[];
  })[];
};

export type ApartmentWithRelations = Apartment & {
  building: Building;
  owner?: Owner & { user: User };
  waterReadings: WaterReading[];
};

export type WaterReadingWithRelations = WaterReading & {
  apartment: Apartment & {
    building: Building;
    owner?: Owner & { user: User };
  };
};

// DTOs for API responses (without sensitive data)
export type UserDTO = Omit<User, "password" | "updatedAt">;
export type BuildingDTO = Omit<Building, "updatedAt">;
export type ApartmentDTO = Omit<Apartment, "updatedAt">;
export type WaterReadingDTO = WaterReading;

// Additional enums for app logic
export enum ReadingStatus {
  PENDING = "PENDING",
  VALIDATED = "VALIDATED",
}
