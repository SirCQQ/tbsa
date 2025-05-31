import { prisma } from "@/lib/prisma";
import { ApartmentInput, ApartmentQuery } from "@/schemas/apartment";
import {
  ApiResponse,
  createServiceError,
  createServiceSuccess,
} from "@/types/api";
import { Apartment, Building, User, Prisma } from "@prisma/client/wasm";
import { PermissionService } from "./permission.service";

export type ApartmentWithRelations = Apartment & {
  building: Pick<Building, "id" | "name" | "address">;
  owner?: {
    id: string;
    user: Pick<User, "id" | "firstName" | "lastName" | "email">;
  } | null;
  _count: {
    waterReadings: number;
  };
};

export type ApartmentDetails = ApartmentWithRelations & {
  building: Building;
};

export class ApartmentService {
  /**
   * Get apartments with filtering and pagination
   */
  static async getApartments(
    query: ApartmentQuery,
    tenantContext?: {
      userId: string;
      administratorId?: string;
      ownerId?: string;
    }
  ): Promise<
    ApiResponse<{
      apartments: ApartmentWithRelations[];
      pagination: {
        total: number;
        pages: number;
        current: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>
  > {
    try {
      const { buildingId, ownerId, page, limit, search } = query;
      const skip = (page - 1) * limit;

      // Build where clause with tenant isolation
      const where: Prisma.ApartmentWhereInput = {};

      // Apply tenant context based on permissions
      if (tenantContext?.userId) {
        const hasAdminPermission = await PermissionService.hasPermission(
          tenantContext.userId,
          { resource: "buildings", action: "read", scope: "own" }
        );
        const hasOwnerPermission = await PermissionService.hasPermission(
          tenantContext.userId,
          { resource: "apartments", action: "read", scope: "own" }
        );

        if (hasAdminPermission && tenantContext.administratorId) {
          // Administrators can only see apartments in their buildings
          where.building = {
            administratorId: tenantContext.administratorId,
          };
        } else if (hasOwnerPermission && tenantContext.ownerId) {
          // Owners can only see their own apartments
          where.ownerId = tenantContext.ownerId;
        }
      }

      // Apply filters
      if (buildingId) {
        where.buildingId = buildingId;
      }
      if (ownerId) {
        where.ownerId = ownerId;
      }
      if (search) {
        where.OR = [
          { number: { contains: search, mode: "insensitive" } },
          { building: { name: { contains: search, mode: "insensitive" } } },
          {
            owner: {
              user: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
        ];
      }

      const [apartments, total] = await Promise.all([
        prisma.apartment.findMany({
          where,
          skip,
          take: limit,
          include: {
            building: {
              select: { id: true, name: true, address: true },
            },
            owner: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: { waterReadings: true },
            },
          },
          orderBy: [{ building: { name: "asc" } }, { number: "asc" }],
        }),
        prisma.apartment.count({ where }),
      ]);

      const pagination = {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      };

      return createServiceSuccess({
        apartments: apartments as ApartmentWithRelations[],
        pagination,
      });
    } catch (error) {
      console.error("Error fetching apartments:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la încărcarea apartamentelor"
      );
    }
  }

  /**
   * Get apartment by ID with detailed information
   */
  static async getApartmentById(
    id: string,
    tenantContext?: {
      userId: string;
      administratorId?: string;
      ownerId?: string;
    }
  ): Promise<ApiResponse<ApartmentDetails>> {
    try {
      // Build where clause with tenant isolation
      const where: Prisma.ApartmentWhereInput = { id };

      if (tenantContext?.userId) {
        const hasAdminPermission = await PermissionService.hasPermission(
          tenantContext.userId,
          { resource: "buildings", action: "read", scope: "own" }
        );
        const hasOwnerPermission = await PermissionService.hasPermission(
          tenantContext.userId,
          { resource: "apartments", action: "read", scope: "own" }
        );

        if (hasAdminPermission && tenantContext.administratorId) {
          where.building = {
            administratorId: tenantContext.administratorId,
          };
        } else if (hasOwnerPermission && tenantContext.ownerId) {
          where.ownerId = tenantContext.ownerId;
        }
      }

      const apartment = await prisma.apartment.findFirst({
        where,
        include: {
          building: true,
          owner: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: { waterReadings: true },
          },
        },
      });

      if (!apartment) {
        return createServiceError("NOT_FOUND", "Apartamentul nu a fost găsit");
      }

      return createServiceSuccess(apartment as ApartmentDetails);
    } catch (error) {
      console.error("Error fetching apartment:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la încărcarea apartamentului"
      );
    }
  }

  /**
   * Create a new apartment
   */
  static async createApartment(
    data: ApartmentInput,
    tenantContext?: { userId: string; administratorId?: string }
  ): Promise<ApiResponse<Apartment>> {
    try {
      // Verify building exists and user has access
      const buildingAccess = await this.checkBuildingAccess(
        data.buildingId,
        tenantContext
      );
      if (!buildingAccess.success) {
        return createServiceError("NOT_FOUND", buildingAccess.message);
      }

      // Check for duplicate apartment number in the same building
      const existingApartment = await prisma.apartment.findFirst({
        where: {
          buildingId: data.buildingId,
          number: data.number,
        },
      });

      if (existingApartment) {
        return createServiceError(
          "DUPLICATE_ENTRY",
          `Apartamentul cu numărul ${data.number} există deja în această clădire`
        );
      }

      // Verify owner exists if provided
      if (data.ownerId) {
        const owner = await prisma.owner.findFirst({
          where: {
            id: data.ownerId,
          },
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        });

        if (!owner) {
          return createServiceError(
            "NOT_FOUND",
            "Proprietarul specificat nu a fost găsit"
          );
        }
      }

      const apartment = await prisma.apartment.create({
        data,
      });

      return createServiceSuccess(apartment);
    } catch (error) {
      console.error("Error creating apartment:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la crearea apartamentului"
      );
    }
  }

  /**
   * Update an existing apartment
   */
  static async updateApartment(
    id: string,
    data: Partial<ApartmentInput>,
    tenantContext?: { userId: string; administratorId?: string }
  ): Promise<ApiResponse<Apartment>> {
    try {
      // Check if apartment exists and user has access
      const apartmentAccess = await this.checkApartmentAccess(
        id,
        tenantContext
      );
      if (!apartmentAccess.success) {
        return createServiceError("NOT_FOUND", apartmentAccess.message);
      }

      const existingApartment = apartmentAccess.data!;

      // If building is being changed, verify access to new building
      if (data.buildingId && data.buildingId !== existingApartment.buildingId) {
        const buildingAccess = await this.checkBuildingAccess(
          data.buildingId,
          tenantContext
        );
        if (!buildingAccess.success) {
          return createServiceError("NOT_FOUND", buildingAccess.message);
        }
      }

      // Check for duplicate apartment number if number or building is being changed
      if (data.number || data.buildingId) {
        const checkBuildingId = data.buildingId || existingApartment.buildingId;
        const checkNumber = data.number || existingApartment.number;

        const duplicateApartment = await prisma.apartment.findFirst({
          where: {
            buildingId: checkBuildingId,
            number: checkNumber,
            NOT: { id },
          },
        });

        if (duplicateApartment) {
          return createServiceError(
            "DUPLICATE_ENTRY",
            `Apartamentul cu numărul ${checkNumber} există deja în această clădire`
          );
        }
      }

      // Verify owner exists if being changed
      if (data.ownerId) {
        const owner = await prisma.owner.findFirst({
          where: {
            id: data.ownerId,
          },
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        });

        if (!owner) {
          return createServiceError(
            "NOT_FOUND",
            "Proprietarul specificat nu a fost găsit"
          );
        }
      }

      const updatedApartment = await prisma.apartment.update({
        where: { id },
        data,
      });

      return createServiceSuccess(updatedApartment);
    } catch (error) {
      console.error("Error updating apartment:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la actualizarea apartamentului"
      );
    }
  }

  /**
   * Delete an apartment
   */
  static async deleteApartment(
    id: string,
    tenantContext?: { userId: string; administratorId?: string }
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      // Check if apartment exists and user has access
      const apartmentAccess = await this.checkApartmentAccess(
        id,
        tenantContext
      );
      if (!apartmentAccess.success) {
        return createServiceError("NOT_FOUND", apartmentAccess.message);
      }

      // Check if apartment has water readings
      const readingsCount = await prisma.waterReading.count({
        where: { apartmentId: id },
      });

      if (readingsCount > 0) {
        return createServiceError(
          "CONSTRAINT_VIOLATION",
          "Nu se poate șterge apartamentul deoarece are citiri de apă asociate"
        );
      }

      await prisma.apartment.delete({
        where: { id },
      });

      return createServiceSuccess({
        message: "Apartament șters cu succes",
      });
    } catch (error) {
      console.error("Error deleting apartment:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la ștergerea apartamentului"
      );
    }
  }

  /**
   * Get apartments by building ID
   */
  static async getApartmentsByBuilding(
    buildingId: string,
    tenantContext?: { userId: string; administratorId?: string }
  ): Promise<ApiResponse<ApartmentWithRelations[]>> {
    try {
      // Verify building exists and user has access
      const buildingAccess = await this.checkBuildingAccess(
        buildingId,
        tenantContext
      );
      if (!buildingAccess.success) {
        return createServiceError("NOT_FOUND", buildingAccess.message);
      }

      const apartments = await prisma.apartment.findMany({
        where: { buildingId },
        include: {
          building: {
            select: { id: true, name: true, address: true },
          },
          owner: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: { waterReadings: true },
          },
        },
        orderBy: { number: "asc" },
      });

      return createServiceSuccess(apartments as ApartmentWithRelations[]);
    } catch (error) {
      console.error("Error fetching apartments by building:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la încărcarea apartamentelor"
      );
    }
  }

  /**
   * Get apartment statistics
   */
  static async getApartmentStats(tenantContext?: {
    userId: string;
    administratorId?: string;
    ownerId?: string;
  }): Promise<
    ApiResponse<{
      total: number;
      occupied: number;
      vacant: number;
      withReadings: number;
    }>
  > {
    try {
      // Build where clause with tenant isolation
      const where: Prisma.ApartmentWhereInput = {};

      if (tenantContext?.userId) {
        const hasAdminPermission = await PermissionService.hasPermission(
          tenantContext.userId,
          { resource: "buildings", action: "read", scope: "own" }
        );
        const hasOwnerPermission = await PermissionService.hasPermission(
          tenantContext.userId,
          { resource: "apartments", action: "read", scope: "own" }
        );

        if (hasAdminPermission && tenantContext.administratorId) {
          where.building = {
            administratorId: tenantContext.administratorId,
          };
        } else if (hasOwnerPermission && tenantContext.ownerId) {
          where.ownerId = tenantContext.ownerId;
        }
      }

      const [total, occupied, withReadings] = await Promise.all([
        prisma.apartment.count({ where }),
        prisma.apartment.count({
          where: { ...where, ownerId: { not: null } },
        }),
        prisma.apartment.count({
          where: {
            ...where,
            waterReadings: { some: {} },
          },
        }),
      ]);

      const vacant = total - occupied;

      return createServiceSuccess({
        total,
        occupied,
        vacant,
        withReadings,
      });
    } catch (error) {
      console.error("Error fetching apartment stats:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la încărcarea statisticilor"
      );
    }
  }

  /**
   * Check if user has access to a building
   */
  private static async checkBuildingAccess(
    buildingId: string,
    tenantContext?: { userId: string; administratorId?: string }
  ): Promise<ApiResponse<Building>> {
    try {
      if (!tenantContext?.userId) {
        return createServiceError("UNAUTHORIZED", "Acces neautorizat");
      }

      const hasPermission = await PermissionService.hasPermission(
        tenantContext.userId,
        { resource: "buildings", action: "read", scope: "own" }
      );

      if (!hasPermission) {
        return createServiceError("FORBIDDEN", "Acces interzis");
      }

      const where: Prisma.BuildingWhereInput = { id: buildingId };

      if (tenantContext.administratorId) {
        where.administratorId = tenantContext.administratorId;
      }

      const building = await prisma.building.findFirst({ where });

      if (!building) {
        return createServiceError("NOT_FOUND", "Clădirea nu a fost găsită");
      }

      return createServiceSuccess(building);
    } catch (error) {
      console.error("Error checking building access:", error);
      return createServiceError("INTERNAL_ERROR", "Eroare de verificare");
    }
  }

  /**
   * Check if user has access to an apartment
   */
  private static async checkApartmentAccess(
    apartmentId: string,
    tenantContext?: {
      userId: string;
      administratorId?: string;
      ownerId?: string;
    }
  ): Promise<ApiResponse<Apartment>> {
    try {
      if (!tenantContext?.userId) {
        return createServiceError("UNAUTHORIZED", "Acces neautorizat");
      }

      const hasAdminPermission = await PermissionService.hasPermission(
        tenantContext.userId,
        { resource: "buildings", action: "read", scope: "own" }
      );
      const hasOwnerPermission = await PermissionService.hasPermission(
        tenantContext.userId,
        { resource: "apartments", action: "read", scope: "own" }
      );

      if (!hasAdminPermission && !hasOwnerPermission) {
        return createServiceError("FORBIDDEN", "Acces interzis");
      }

      const where: Prisma.ApartmentWhereInput = { id: apartmentId };

      if (hasAdminPermission && tenantContext.administratorId) {
        where.building = {
          administratorId: tenantContext.administratorId,
        };
      } else if (hasOwnerPermission && tenantContext.ownerId) {
        where.ownerId = tenantContext.ownerId;
      }

      const apartment = await prisma.apartment.findFirst({ where });

      if (!apartment) {
        return createServiceError("NOT_FOUND", "Apartamentul nu a fost găsit");
      }

      return createServiceSuccess(apartment);
    } catch (error) {
      console.error("Error checking apartment access:", error);
      return createServiceError("INTERNAL_ERROR", "Eroare de verificare");
    }
  }
}
