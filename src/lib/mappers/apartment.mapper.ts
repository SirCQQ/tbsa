import type { Apartment, Building, Owner } from "@prisma/client";

export type ApartmentWithBuilding = Apartment & {
  building: Pick<Building, "id" | "name" | "address" | "city">;
};

export type ApartmentWithOwner = Apartment & {
  owner:
    | (Pick<Owner, "id"> & {
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
      })
    | null;
};

export type ApartmentWithBuildingAndOwner = Apartment & {
  building: Pick<Building, "id" | "name" | "address" | "city">;
  owner:
    | (Pick<Owner, "id"> & {
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
      })
    | null;
};

/**
 * Maps apartment to API response format
 */
export function mapApartmentToApiResponse(apartment: Apartment) {
  return {
    id: apartment.id,
    number: apartment.number,
    floor: apartment.floor,
    rooms: apartment.rooms,
    buildingId: apartment.buildingId,
    ownerId: apartment.ownerId,
    createdAt: apartment.createdAt,
    updatedAt: apartment.updatedAt,
  };
}

/**
 * Maps apartment with building to API response format
 */
export function mapApartmentWithBuildingToApiResponse(
  apartment: ApartmentWithBuilding
) {
  return {
    id: apartment.id,
    number: apartment.number,
    floor: apartment.floor,
    rooms: apartment.rooms,
    building: {
      id: apartment.building.id,
      name: apartment.building.name,
      address: apartment.building.address,
      city: apartment.building.city,
    },
    ownerId: apartment.ownerId,
    createdAt: apartment.createdAt,
    updatedAt: apartment.updatedAt,
  };
}

/**
 * Maps apartment with owner to API response format
 */
export function mapApartmentWithOwnerToApiResponse(
  apartment: ApartmentWithOwner
) {
  return {
    id: apartment.id,
    number: apartment.number,
    floor: apartment.floor,
    rooms: apartment.rooms,
    buildingId: apartment.buildingId,
    owner: apartment.owner
      ? {
          id: apartment.owner.id,
          user: {
            id: apartment.owner.user.id,
            firstName: apartment.owner.user.firstName,
            lastName: apartment.owner.user.lastName,
            email: apartment.owner.user.email,
          },
        }
      : null,
    createdAt: apartment.createdAt,
    updatedAt: apartment.updatedAt,
  };
}

/**
 * Maps apartment for display purposes
 */
export function mapApartmentForDisplay(
  apartment: ApartmentWithBuildingAndOwner
) {
  const floorDisplay =
    apartment.floor === 0 ? "Parter" : `Etaj ${apartment.floor}`;

  return {
    id: apartment.id,
    number: apartment.number,
    floorDisplay,
    floor: apartment.floor,
    rooms: apartment.rooms,
    buildingName: apartment.building.name,
    ownerName: apartment.owner
      ? `${apartment.owner.user.firstName} ${apartment.owner.user.lastName}`
      : "Nealocat",
    ownerEmail: apartment.owner?.user.email || null,
    isOccupied: apartment.owner !== null,
  };
}

/**
 * Maps apartment for select/dropdown components
 */
export function mapApartmentForSelect(apartment: ApartmentWithBuilding) {
  const floorDisplay =
    apartment.floor === 0 ? "Parter" : `Etaj ${apartment.floor}`;

  return {
    value: apartment.id,
    label: `Apt. ${apartment.number} (${floorDisplay}, ${apartment.rooms} camere)`,
    building: apartment.building.name,
    floor: apartment.floor,
    number: apartment.number,
  };
}

/**
 * Maps multiple apartments to API response format
 */
export function mapApartmentsToApiResponse(apartments: Apartment[]) {
  return apartments.map(mapApartmentToApiResponse);
}

/**
 * Maps multiple apartments with building to API response format
 */
export function mapApartmentsWithBuildingToApiResponse(
  apartments: ApartmentWithBuilding[]
) {
  return apartments.map(mapApartmentWithBuildingToApiResponse);
}

/**
 * Maps multiple apartments for display
 */
export function mapApartmentsForDisplay(
  apartments: ApartmentWithBuildingAndOwner[]
) {
  return apartments.map(mapApartmentForDisplay);
}

/**
 * Maps multiple apartments for select components
 */
export function mapApartmentsForSelect(apartments: ApartmentWithBuilding[]) {
  return apartments.map(mapApartmentForSelect);
}

/**
 * Groups apartments by floor for display
 */
export function groupApartmentsByFloor(
  apartments: ApartmentWithBuildingAndOwner[]
) {
  const mapped = mapApartmentsForDisplay(apartments);

  return mapped.reduce((groups, apartment) => {
    const floor = apartment.floor ?? 0; // Default to 0 if floor is null
    const floorKey = floor.toString();
    if (!groups[floorKey]) {
      groups[floorKey] = [];
    }
    groups[floorKey].push(apartment);
    return groups;
  }, {} as Record<string, ReturnType<typeof mapApartmentForDisplay>[]>);
}
