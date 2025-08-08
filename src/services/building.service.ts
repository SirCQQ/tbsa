import { prisma } from "@/lib/prisma";
import {
  CreateBuildingInput,
  UpdateBuildingInput,
} from "@/lib/validations/building";
import { ServiceResult } from "@/types/api-response";
import type { Prisma } from "@prisma/client";

export type BuildingWithOrganization = Prisma.BuildingGetPayload<{
  include: {
    organization: {
      select: {
        id: true;
        name: true;
        code: true;
      };
    };
  };
}>;

export type BuildingWithApartmentsAndOrganization = Prisma.BuildingGetPayload<{
  include: {
    organization: {
      select: {
        id: true;
        name: true;
        code: true;
      };
    };
  };
}>;

export type BuildingStats = {
  totalApartments: number;
  occupiedApartments: number;
  vacantApartments: number;
  apartmentsByFloor: Record<string, any[]>;
  occupancyRate: number;
};

class BuildingService {
  private includeOrganization = {
    organization: {
      select: {
        id: true,
        name: true,
        code: true,
      },
    },
  };

  /**
   * Generate a unique 8-character alphanumeric building code (A-Z, 0-9)
   */
  private generateBuildingCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Check if a building code is unique within an organization
   */
  private async isCodeUnique(
    code: string,
    organizationId: string
  ): Promise<boolean> {
    const existingBuilding = await prisma.building.findFirst({
      where: {
        code,
        organizationId,
      },
    });
    return !existingBuilding;
  }

  /**
   * Generate a unique building code for an organization
   */
  private async generateUniqueBuildingCode(
    organizationId: string
  ): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateBuildingCode();
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error(
          "Nu s-a putut genera un cod unic pentru clădire după mai multe încercări"
        );
      }
    } while (!(await this.isCodeUnique(code, organizationId)));

    return code;
  }

  /**
   * Create a new building with auto-generated code
   */
  async createBuilding(
    input: CreateBuildingInput
  ): Promise<ServiceResult<BuildingWithOrganization | undefined>> {
    try {
      // First, verify the organization exists
      const orgExists = await prisma.organization.findUnique({
        where: { id: input.organizationId },
        select: { id: true, name: true, code: true },
      });

      if (!orgExists) {
        return {
          success: false,
          error: `Organizatia cu id-ul ${input.organizationId} nu a fost găsită`,
        };
      }

      // Generate unique building code
      const code = await this.generateUniqueBuildingCode(input.organizationId);

      // Create the building

      const building = await prisma.building.create({
        data: {
          name: input.name,
          code,
          address: input.address,
          type: input.type,
          floors: input.floors,
          totalApartments: input.totalApartments,
          description: input.description,
          readingDay: input.readingDay || 15, // Default to 15th of month
          organizationId: input.organizationId,
        },
        include: {
          organization: this.includeOrganization.organization,
        },
      });

      return {
        success: true,
        data: building,
      };
    } catch (error) {
      // Log error details without complex object formatting to avoid Next.js source map bug
      console.error(
        "Building creation error:",
        error instanceof Error ? error.message : String(error)
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "A intervenit o eroare la crearea clădirii",
      };
    }
  }

  /**
   * Get buildings for an organization with access control
   */
  async getBuildingsByOrg(
    organizationId: string,
    userId: string,
    userRoles: string[]
  ): Promise<ServiceResult<BuildingWithApartmentsAndOrganization[]>> {
    try {
      // Check if user is super admin (has full access)
      const isSuperAdmin = userRoles.includes("SUPER_ADMIN");

      if (!isSuperAdmin) {
        // Verify user has access to this organization
        const userOrg = await prisma.userOrganization.findFirst({
          where: {
            userId,
            organizationId,
          },
        });

        if (!userOrg) {
          return {
            success: false,
            error: "Nu aveți acces la această organizație",
          };
        }
      }

      const buildings = await prisma.building.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        include: {
          organization: this.includeOrganization.organization,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        data: buildings,
      };
    } catch (error) {
      console.error(
        "Error fetching buildings:",
        error instanceof Error ? error.message : String(error)
      );
      return {
        success: false,
        error: "Eroare la preluarea clădirilor",
      };
    }
  }

  /**
   * Get building by ID with access control
   */
  async getBuildingById(
    buildingId: string,
    userId: string,
    userRoles: string[]
  ): Promise<ServiceResult<BuildingWithApartmentsAndOrganization | null>> {
    try {
      // Check if user is super admin (has full access)
      const isSuperAdmin = userRoles.includes("SUPER_ADMIN");

      let building;

      if (isSuperAdmin) {
        // Super admin can access any building
        building = await prisma.building.findFirst({
          where: {
            id: buildingId,
            deletedAt: null,
          },
          include: {
            organization: this.includeOrganization.organization,
          },
        });
      } else {
        // Regular users can only access buildings in their organizations
        building = await prisma.building.findFirst({
          where: {
            id: buildingId,
            deletedAt: null,
            organization: {
              users: {
                some: {
                  userId: userId,
                },
              },
            },
          },
          include: {
            organization: this.includeOrganization.organization,
          },
        });
      }

      if (!building && !isSuperAdmin) {
        return {
          success: false,
          error: "Clădirea nu a fost găsită sau nu aveți acces la ea",
        };
      }

      return {
        success: true,
        data: building,
      };
    } catch (error) {
      console.error(
        "Error fetching building:",
        error instanceof Error ? error.message : String(error)
      );
      return {
        success: false,
        error: "Eroare la preluarea clădirii",
      };
    }
  }

  /**
   * Find building by code within organization
   */
  async getBuildingByCode(
    code: string,
    organizationId: string
  ): Promise<ServiceResult<BuildingWithOrganization | null>> {
    try {
      const building = await prisma.building.findFirst({
        where: {
          code: code.toUpperCase(),
          organizationId,
          deletedAt: null,
        },
        include: {
          organization: this.includeOrganization.organization,
        },
      });

      return {
        success: true,
        data: building,
      };
    } catch (error) {
      console.error(
        "Error fetching building by code:",
        error instanceof Error ? error.message : String(error)
      );
      return {
        success: false,
        error: "Eroare la preluarea clădirii după cod",
      };
    }
  }

  /**
   * Update building with floor validation
   */
  async updateBuilding(
    buildingId: string,
    organizationId: string,
    input: UpdateBuildingInput
  ): Promise<ServiceResult<BuildingWithApartmentsAndOrganization>> {
    try {
      // First, get the current building
      const currentBuilding = await prisma.building.findFirst({
        where: {
          id: buildingId,
          organizationId,
          deletedAt: null,
        },
        include: {
          apartments: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              floor: true,
            },
          },
        },
      });

      if (!currentBuilding) {
        return {
          success: false,
          error: "Clădirea nu a fost găsită sau nu aveți permisiunile necesare",
        };
      }

      // If floors are being reduced, check for apartments on higher floors
      if (input.floors !== undefined && input.floors < currentBuilding.floors) {
        const apartmentsOnHigherFloors = currentBuilding.apartments.filter(
          (apt) => apt.floor > input.floors!
        );

        if (apartmentsOnHigherFloors.length > 0) {
          const affectedFloors = [
            ...new Set(apartmentsOnHigherFloors.map((apt) => apt.floor)),
          ].sort((a, b) => a - b);

          return {
            success: false,
            error: `Nu se poate reduce numărul de etaje de la ${currentBuilding.floors} la ${input.floors} deoarece există ${apartmentsOnHigherFloors.length} apartamente pe etajele ${affectedFloors.join(", ")}. Ștergeți mai întâi apartamentele de pe aceste etaje.`,
          };
        }
      }

      // Update the building
      const updatedBuilding = await prisma.building.update({
        where: {
          id: buildingId,
        },
        data: {
          name: input.name,
          address: input.address,
          floors: input.floors,
          description: input.description,
          updatedAt: new Date(),
        },
        include: {
          organization: this.includeOrganization.organization,
        },
      });

      return {
        success: true,
        data: updatedBuilding,
      };
    } catch (error) {
      console.error(
        "Building update error:",
        error instanceof Error ? error.message : String(error)
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "A intervenit o eroare la actualizarea clădirii",
      };
    }
  }

  async deleteBuilding(
    buildingId: string,
    organizationId: string
  ): Promise<ServiceResult<BuildingWithOrganization | null>> {
    try {
      // First, check if the building exists
      const existingBuilding = await prisma.building.findFirst({
        where: {
          id: buildingId,
          organizationId,
          deletedAt: null,
        },
        include: {
          organization: this.includeOrganization.organization,
        },
      });

      if (!existingBuilding) {
        return {
          success: false,
          error: "Clădirea nu a fost găsită sau nu aveți permisiunile necesare",
        };
      }

      // Soft delete the building
      const deletedBuilding = await prisma.building.update({
        where: { id: buildingId },
        data: { deletedAt: new Date() },
        include: {
          organization: this.includeOrganization.organization,
        },
      });

      return {
        success: true,
        data: deletedBuilding,
      };
    } catch (error) {
      console.error(
        "Building deletion error:",
        error instanceof Error ? error.message : String(error)
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "A intervenit o eroare la ștergerea clădirii",
      };
    }
  }

  /**
   * Get building statistics by ID with access control
   */
  async getBuildingStatsById(
    buildingId: string,
    userId: string,
    userRoles: string[]
  ): Promise<ServiceResult<BuildingStats>> {
    try {
      // Check if user is super admin (has full access)
      const isSuperAdmin = userRoles.includes("SUPER_ADMIN");

      let building;

      if (isSuperAdmin) {
        // Super admin can access any building stats
        building = await prisma.building.findFirst({
          where: {
            id: buildingId,
            deletedAt: null,
          },
        });
      } else {
        // Regular users can only access buildings in their organizations
        building = await prisma.building.findFirst({
          where: {
            id: buildingId,
            deletedAt: null,
            organization: {
              users: {
                some: {
                  userId: userId,
                },
              },
            },
          },
        });
      }

      if (!building) {
        return {
          success: false,
          error: "Clădirea nu a fost găsită sau nu aveți acces la ea",
        };
      }

      // Get apartment statistics
      const apartments = await prisma.apartment.findMany({
        where: {
          buildingId,
          deletedAt: null,
        },
        select: {
          id: true,
          number: true,
          floor: true,
          isOccupied: true,
          occupantCount: true,
          surface: true,
        },
      });

      // Calculate statistics
      const totalApartments = apartments.length;
      const occupiedApartments = apartments.filter(
        (apt) => apt.isOccupied
      ).length;
      const vacantApartments = totalApartments - occupiedApartments;
      const occupancyRate =
        totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0;

      // Group apartments by floor
      const apartmentsByFloor = apartments.reduce(
        (acc, apartment) => {
          const floorKey = apartment.floor.toString();
          if (!acc[floorKey]) {
            acc[floorKey] = [];
          }
          acc[floorKey].push({
            id: apartment.id,
            number: apartment.number,
            floor: apartment.floor,
            isOccupied: apartment.isOccupied,
            occupantCount: apartment.occupantCount,
            surface: apartment.surface,
          });
          return acc;
        },
        {} as Record<string, any[]>
      );

      const stats: BuildingStats = {
        totalApartments,
        occupiedApartments,
        vacantApartments,
        apartmentsByFloor,
        occupancyRate: Math.round(occupancyRate * 100) / 100, // Round to 2 decimal places
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching building stats:", error);
      return {
        success: false,
        error: "Eroare la încărcarea statisticilor clădirii",
      };
    }
  }
}

// Export singleton instance
export const buildingService = new BuildingService();
