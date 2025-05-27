import { prisma } from "@/lib/prisma";
import {
  CreateBuildingSchema,
  CreateBuildingWithApartmentsSchema,
  UpdateBuildingSchema,
  BuildingQuerySchema,
  BuildingIdSchema,
  type CreateBuildingData,
  type CreateBuildingWithApartmentsData,
  type UpdateBuildingData,
} from "@/schemas/building";
import { ZodError } from "zod";
import type {
  Building,
  Apartment,
  Administrator,
  User,
} from "@prisma/client/wasm";

export interface BuildingWithDetails extends Building {
  _count: {
    apartments: number;
  };
  administrator: Administrator & {
    user: Pick<User, "firstName" | "lastName" | "email">;
  };
  apartments?: (Apartment & {
    owner?: {
      user: Pick<User, "firstName" | "lastName" | "email" | "phone">;
    };
    _count: {
      waterReadings: number;
    };
  })[];
}

export interface BuildingListResult {
  buildings: BuildingWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: unknown;
}

export interface BuildingStats {
  totalBuildings: number;
  totalApartments: number;
}

export class BuildingsService {
  /**
   * Get paginated list of buildings for an administrator
   */
  static async getBuildings(
    administratorId: string,
    queryParams: Record<string, string>
  ): Promise<ServiceResult<BuildingListResult>> {
    try {
      // Validate query parameters
      const { page, limit, search } = BuildingQuerySchema.parse(queryParams);
      const skip = (page - 1) * limit;

      // Build where clause for search
      const whereClause = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { address: { contains: search, mode: "insensitive" as const } },
              { city: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      // Get buildings with apartment count
      const [buildings, total] = await Promise.all([
        prisma.building.findMany({
          where: {
            ...whereClause,
            administratorId, // Only buildings managed by this admin
          },
          skip,
          take: limit,
          include: {
            _count: {
              select: { apartments: true },
            },
            administrator: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { name: "asc" },
        }),
        prisma.building.count({
          where: {
            ...whereClause,
            administratorId,
          },
        }),
      ]);

      return {
        success: true,
        data: {
          buildings: buildings as BuildingWithDetails[],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error in BuildingsService.getBuildings:", error);

      if (error instanceof ZodError) {
        return {
          success: false,
          error: "Parametrii de interogare sunt invalizi",
          code: "VALIDATION_FAILED",
          details: error.format(),
        };
      }

      return {
        success: false,
        error: "Eroare internă la obținerea clădirilor",
        code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Get building by ID with full details
   */
  static async getBuildingById(
    buildingId: string,
    administratorId: string
  ): Promise<ServiceResult<BuildingWithDetails>> {
    try {
      // Validate building ID
      const { id } = BuildingIdSchema.parse({ id: buildingId });

      // Get building with apartments
      const building = await prisma.building.findFirst({
        where: {
          id,
          administratorId, // Only buildings managed by this admin
        },
        include: {
          _count: {
            select: { apartments: true },
          },
          apartments: {
            include: {
              owner: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
              _count: {
                select: { waterReadings: true },
              },
            },
            orderBy: { number: "asc" },
          },
          administrator: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!building) {
        return {
          success: false,
          error: "Clădirea nu a fost găsită",
          code: "BUILDING_NOT_FOUND",
        };
      }

      return {
        success: true,
        data: building as BuildingWithDetails,
      };
    } catch (error) {
      console.error("Error in BuildingsService.getBuildingById:", error);

      if (error instanceof ZodError) {
        return {
          success: false,
          error: "ID-ul clădirii este invalid",
          code: "VALIDATION_FAILED",
          details: error.format(),
        };
      }

      return {
        success: false,
        error: "Eroare internă la obținerea clădirii",
        code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Create a new building
   */
  static async createBuilding(
    buildingData: unknown,
    administratorId: string
  ): Promise<ServiceResult<BuildingWithDetails>> {
    try {
      // Validate request data
      const validatedData: CreateBuildingData =
        CreateBuildingSchema.parse(buildingData);

      // Check if building with same name and address already exists for this admin
      const existingBuilding = await prisma.building.findFirst({
        where: {
          name: validatedData.name,
          address: validatedData.address,
          administratorId,
        },
      });

      if (existingBuilding) {
        return {
          success: false,
          error: "O clădire cu același nume și adresă există deja",
          code: "BUILDING_ALREADY_EXISTS",
        };
      }

      // Create the building
      const building = await prisma.building.create({
        data: {
          ...validatedData,
          administratorId,
        },
        include: {
          _count: {
            select: { apartments: true },
          },
          administrator: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: building as BuildingWithDetails,
      };
    } catch (error) {
      console.error("Error in BuildingsService.createBuilding:", error);

      if (error instanceof ZodError) {
        return {
          success: false,
          error: "Datele introduse sunt invalide",
          code: "VALIDATION_FAILED",
          details: error.format(),
        };
      }

      return {
        success: false,
        error: "Eroare internă la crearea clădirii",
        code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Create a new building with optional apartments
   */
  static async createBuildingWithApartments(
    buildingData: unknown,
    administratorId: string
  ): Promise<ServiceResult<BuildingWithDetails>> {
    try {
      // Validate request data
      const validatedData: CreateBuildingWithApartmentsData =
        CreateBuildingWithApartmentsSchema.parse(buildingData);

      // Check if building with same name and address already exists for this admin
      const existingBuilding = await prisma.building.findFirst({
        where: {
          name: validatedData.name,
          address: validatedData.address,
          administratorId,
        },
      });

      if (existingBuilding) {
        return {
          success: false,
          error: "O clădire cu același nume și adresă există deja",
          code: "BUILDING_ALREADY_EXISTS",
        };
      }

      // Prepare apartments data
      let apartmentsToCreate: Array<{
        number: string;
        floor?: number;
        rooms?: number;
      }> = [];

      if (
        validatedData.autoGenerateApartments &&
        validatedData.floors &&
        validatedData.apartmentsPerFloor
      ) {
        // Auto-generate apartments based on floors and apartments per floor
        for (let floor = 1; floor <= validatedData.floors; floor++) {
          for (let apt = 1; apt <= validatedData.apartmentsPerFloor; apt++) {
            apartmentsToCreate.push({
              number: `${floor}${apt.toString().padStart(2, "0")}`, // e.g., "101", "102", "201", etc.
              floor: floor,
              rooms: undefined, // Can be set later
            });
          }
        }
      } else if (
        validatedData.apartments &&
        validatedData.apartments.length > 0
      ) {
        // Use manually specified apartments
        apartmentsToCreate = validatedData.apartments;
      }

      // Create building and apartments in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the building first
        const building = await tx.building.create({
          data: {
            name: validatedData.name,
            address: validatedData.address,
            city: validatedData.city,
            postalCode: validatedData.postalCode,
            readingDeadline: validatedData.readingDeadline,
            floors: validatedData.floors,
            totalApartments:
              validatedData.totalApartments ||
              apartmentsToCreate.length ||
              undefined,
            yearBuilt: validatedData.yearBuilt,
            description: validatedData.description,
            hasElevator: validatedData.hasElevator,
            hasParking: validatedData.hasParking,
            hasGarden: validatedData.hasGarden,
            type: "RESIDENTIAL", // Always residential for now
            administratorId,
          },
        });

        // Create apartments if any
        if (apartmentsToCreate.length > 0) {
          await tx.apartment.createMany({
            data: apartmentsToCreate.map((apt) => ({
              ...apt,
              buildingId: building.id,
            })),
          });
        }

        // Return building with full details
        return await tx.building.findUnique({
          where: { id: building.id },
          include: {
            _count: {
              select: { apartments: true },
            },
            administrator: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        });
      });

      return {
        success: true,
        data: result as BuildingWithDetails,
      };
    } catch (error) {
      console.error(
        "Error in BuildingsService.createBuildingWithApartments:",
        error
      );

      if (error instanceof ZodError) {
        return {
          success: false,
          error: "Datele introduse sunt invalide",
          code: "VALIDATION_FAILED",
          details: error.format(),
        };
      }

      return {
        success: false,
        error: "Eroare internă la crearea clădirii",
        code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Update an existing building
   */
  static async updateBuilding(
    buildingId: string,
    buildingData: unknown,
    administratorId: string
  ): Promise<ServiceResult<BuildingWithDetails>> {
    try {
      // Validate building ID
      const { id } = BuildingIdSchema.parse({ id: buildingId });

      // Validate request data
      const validatedData: UpdateBuildingData =
        UpdateBuildingSchema.parse(buildingData);

      // Check if building exists and belongs to this admin
      const existingBuilding = await prisma.building.findFirst({
        where: {
          id,
          administratorId,
        },
      });

      if (!existingBuilding) {
        return {
          success: false,
          error: "Clădirea nu a fost găsită",
          code: "BUILDING_NOT_FOUND",
        };
      }

      // Check for duplicate name/address if they're being updated
      if (validatedData.name || validatedData.address) {
        const duplicateBuilding = await prisma.building.findFirst({
          where: {
            id: { not: id }, // Exclude current building
            name: validatedData.name || existingBuilding.name,
            address: validatedData.address || existingBuilding.address,
            administratorId,
          },
        });

        if (duplicateBuilding) {
          return {
            success: false,
            error: "O clădire cu același nume și adresă există deja",
            code: "BUILDING_ALREADY_EXISTS",
          };
        }
      }

      // Update the building
      const updatedBuilding = await prisma.building.update({
        where: { id },
        data: validatedData,
        include: {
          _count: {
            select: { apartments: true },
          },
          administrator: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: updatedBuilding as BuildingWithDetails,
      };
    } catch (error) {
      console.error("Error in BuildingsService.updateBuilding:", error);

      if (error instanceof ZodError) {
        return {
          success: false,
          error: "Datele introduse sunt invalide",
          code: "VALIDATION_FAILED",
          details: error.format(),
        };
      }

      return {
        success: false,
        error: "Eroare internă la actualizarea clădirii",
        code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Delete a building
   */
  static async deleteBuilding(
    buildingId: string,
    administratorId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Validate building ID
      const { id } = BuildingIdSchema.parse({ id: buildingId });

      // Check if building exists and belongs to this admin
      const existingBuilding = await prisma.building.findFirst({
        where: {
          id,
          administratorId,
        },
        include: {
          _count: {
            select: { apartments: true },
          },
        },
      });

      if (!existingBuilding) {
        return {
          success: false,
          error: "Clădirea nu a fost găsită",
          code: "BUILDING_NOT_FOUND",
        };
      }

      // Check if building has apartments (optional warning)
      if (existingBuilding._count.apartments > 0) {
        // You might want to prevent deletion or require a force flag
        // For now, we'll allow it since Prisma schema has CASCADE delete
        console.warn(
          `Deleting building ${id} with ${existingBuilding._count.apartments} apartments`
        );
      }

      // Delete the building (CASCADE will handle apartments and water readings)
      await prisma.building.delete({
        where: { id },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error in BuildingsService.deleteBuilding:", error);

      if (error instanceof ZodError) {
        return {
          success: false,
          error: "ID-ul clădirii este invalid",
          code: "VALIDATION_FAILED",
          details: error.format(),
        };
      }

      return {
        success: false,
        error: "Eroare internă la ștergerea clădirii",
        code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Check if administrator has access to building
   */
  static async checkBuildingAccess(
    buildingId: string,
    administratorId: string
  ): Promise<boolean> {
    try {
      const building = await prisma.building.findFirst({
        where: {
          id: buildingId,
          administratorId,
        },
        select: { id: true },
      });

      return !!building;
    } catch (error) {
      console.error("Error in BuildingsService.checkBuildingAccess:", error);
      return false;
    }
  }

  /**
   * Get building statistics for an administrator
   */
  static async getBuildingStats(
    administratorId: string
  ): Promise<ServiceResult<BuildingStats>> {
    try {
      const stats = await prisma.building.aggregate({
        where: { administratorId },
        _count: { id: true },
      });

      const apartmentStats = await prisma.apartment.aggregate({
        where: {
          building: { administratorId },
        },
        _count: { id: true },
      });

      return {
        success: true,
        data: {
          totalBuildings: stats._count.id,
          totalApartments: apartmentStats._count.id,
        },
      };
    } catch (error) {
      console.error("Error in BuildingsService.getBuildingStats:", error);
      return {
        success: false,
        error: "Eroare internă la obținerea statisticilor",
        code: "INTERNAL_ERROR",
      };
    }
  }
}
