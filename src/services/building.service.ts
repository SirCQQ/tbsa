import { prisma } from "@/lib/prisma";
import type { Building, BuildingType } from "@prisma/client/wasm";

export type CreateBuildingInput = {
  name: string;
  address: string;
  type: BuildingType;
  floors: number;
  totalApartments: number;
  description?: string;
  readingDay?: number;
  organizationId: string;
};

export type BuildingServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

class BuildingService {
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
          "Unable to generate unique building code after maximum attempts"
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
  ): Promise<BuildingServiceResult<Building>> {
    try {
      // First, verify the organization exists
      const orgExists = await prisma.organization.findUnique({
        where: { id: input.organizationId },
        select: { id: true, name: true, code: true },
      });

      if (!orgExists) {
        return {
          success: false,
          error: `Organization with ID ${input.organizationId} does not exist`,
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
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
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
          error instanceof Error ? error.message : "Failed to create building",
      };
    }
  }

  /**
   * Get buildings for an organization
   */
  async getBuildingsByOrganization(
    organizationId: string
  ): Promise<BuildingServiceResult<Building[]>> {
    try {
      const buildings = await prisma.building.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          apartments: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              number: true,
              floor: true,
              isOccupied: true,
            },
          },
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
      console.error("Error fetching buildings:", error);
      return {
        success: false,
        error: "Failed to fetch buildings",
      };
    }
  }

  /**
   * Get building by ID and verify organization access
   */
  async getBuildingById(
    buildingId: string,
    organizationId: string
  ): Promise<BuildingServiceResult<Building | null>> {
    try {
      const building = await prisma.building.findFirst({
        where: {
          id: buildingId,
          organizationId,
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          apartments: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              number: true,
              floor: true,
              isOccupied: true,
              surface: true,
            },
          },
        },
      });

      return {
        success: true,
        data: building,
      };
    } catch (error) {
      console.error("Error fetching building:", error);
      return {
        success: false,
        error: "Failed to fetch building",
      };
    }
  }

  /**
   * Find building by code within organization
   */
  async getBuildingByCode(
    code: string,
    organizationId: string
  ): Promise<BuildingServiceResult<Building | null>> {
    try {
      const building = await prisma.building.findFirst({
        where: {
          code: code.toUpperCase(),
          organizationId,
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return {
        success: true,
        data: building,
      };
    } catch (error) {
      console.error("Error fetching building by code:", error);
      return {
        success: false,
        error: "Failed to fetch building by code",
      };
    }
  }
}

// Export singleton instance
export const buildingService = new BuildingService();
