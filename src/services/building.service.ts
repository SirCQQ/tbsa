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
   * Get buildings for an organization
   */
  async getBuildingsByOrganization(
    organizationId: string
  ): Promise<ServiceResult<BuildingWithApartmentsAndOrganization[]>> {
    try {
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
      // Log error details without complex object formatting to avoid Next.js source map bug
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
   * Get building by ID and verify organization access
   */
  async getBuildingById(
    buildingId: string,
    organizationId: string
  ): Promise<ServiceResult<BuildingWithApartmentsAndOrganization | null>> {
    try {
      const building = await prisma.building.findFirst({
        where: {
          id: buildingId,
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
}

// Export singleton instance
export const buildingService = new BuildingService();
