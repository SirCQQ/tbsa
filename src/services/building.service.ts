import { ApiResponse } from "../types/api";
import { prisma } from "../lib/prisma";
import {
  TenantContext,
  createBuildingFilter,
  canAccessBuilding,
} from "../lib/tenant";
import type { Building } from "@prisma/client/wasm";

export type CreateBuildingRequest = {
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  readingDeadline?: number;
};

export type UpdateBuildingRequest = {
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  readingDeadline?: number;
};

export class BuildingService {
  /**
   * Get all buildings for the current tenant (administrator)
   */
  static async getBuildings(
    context: TenantContext
  ): Promise<ApiResponse<Building[]>> {
    try {
      if (context.role !== "ADMINISTRATOR" || !context.administratorId) {
        return {
          success: false,
          message: "Access denied",
          error: "Only administrators can access buildings",
        };
      }

      const filter = createBuildingFilter(context);

      const buildings = await prisma.building.findMany({
        where: filter,
        include: {
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
          apartments: {
            include: {
              owner: {
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
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        success: true,
        message: "Buildings retrieved successfully",
        data: buildings,
      };
    } catch (error) {
      console.error("Error fetching buildings:", error);
      return {
        success: false,
        message: "Failed to fetch buildings",
        error: "Internal server error",
      };
    }
  }

  /**
   * Get a specific building by ID (with tenant isolation)
   */
  static async getBuildingById(
    buildingId: string,
    context: TenantContext
  ): Promise<ApiResponse<Building>> {
    try {
      if (context.role !== "ADMINISTRATOR" || !context.administratorId) {
        return {
          success: false,
          message: "Access denied",
          error: "Only administrators can access buildings",
        };
      }

      const building = await prisma.building.findUnique({
        where: { id: buildingId },
        include: {
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
          apartments: {
            include: {
              owner: {
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
          },
        },
      });

      if (!building) {
        return {
          success: false,
          message: "Building not found",
          error: "Building does not exist",
        };
      }

      // Verify tenant access
      if (!canAccessBuilding(context, building.administratorId)) {
        return {
          success: false,
          message: "Access denied",
          error: "You don't have permission to access this building",
        };
      }

      return {
        success: true,
        message: "Building retrieved successfully",
        data: building,
      };
    } catch (error) {
      console.error("Error fetching building:", error);
      return {
        success: false,
        message: "Failed to fetch building",
        error: "Internal server error",
      };
    }
  }

  /**
   * Create a new building (only for administrators)
   */
  static async createBuilding(
    data: CreateBuildingRequest,
    context: TenantContext
  ): Promise<ApiResponse<Building>> {
    try {
      if (context.role !== "ADMINISTRATOR" || !context.administratorId) {
        return {
          success: false,
          message: "Access denied",
          error: "Only administrators can create buildings",
        };
      }

      const building = await prisma.building.create({
        data: {
          name: data.name,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          readingDeadline: data.readingDeadline || 25,
          administratorId: context.administratorId, // Ensure tenant isolation
        },
        include: {
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
        message: "Building created successfully",
        data: building,
      };
    } catch (error) {
      console.error("Error creating building:", error);
      return {
        success: false,
        message: "Failed to create building",
        error: "Internal server error",
      };
    }
  }

  /**
   * Update a building (with tenant isolation)
   */
  static async updateBuilding(
    buildingId: string,
    data: UpdateBuildingRequest,
    context: TenantContext
  ): Promise<ApiResponse<Building>> {
    try {
      if (context.role !== "ADMINISTRATOR" || !context.administratorId) {
        return {
          success: false,
          message: "Access denied",
          error: "Only administrators can update buildings",
        };
      }

      // First verify the building exists and belongs to this administrator
      const existingBuilding = await prisma.building.findUnique({
        where: { id: buildingId },
      });

      if (!existingBuilding) {
        return {
          success: false,
          message: "Building not found",
          error: "Building does not exist",
        };
      }

      if (!canAccessBuilding(context, existingBuilding.administratorId)) {
        return {
          success: false,
          message: "Access denied",
          error: "You don't have permission to update this building",
        };
      }

      const updatedBuilding = await prisma.building.update({
        where: { id: buildingId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.address && { address: data.address }),
          ...(data.city && { city: data.city }),
          ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
          ...(data.readingDeadline && {
            readingDeadline: data.readingDeadline,
          }),
        },
        include: {
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
        message: "Building updated successfully",
        data: updatedBuilding,
      };
    } catch (error) {
      console.error("Error updating building:", error);
      return {
        success: false,
        message: "Failed to update building",
        error: "Internal server error",
      };
    }
  }

  /**
   * Delete a building (with tenant isolation)
   */
  static async deleteBuilding(
    buildingId: string,
    context: TenantContext
  ): Promise<ApiResponse<void>> {
    try {
      if (context.role !== "ADMINISTRATOR" || !context.administratorId) {
        return {
          success: false,
          message: "Access denied",
          error: "Only administrators can delete buildings",
        };
      }

      // First verify the building exists and belongs to this administrator
      const existingBuilding = await prisma.building.findUnique({
        where: { id: buildingId },
        include: {
          apartments: true,
        },
      });

      if (!existingBuilding) {
        return {
          success: false,
          message: "Building not found",
          error: "Building does not exist",
        };
      }

      if (!canAccessBuilding(context, existingBuilding.administratorId)) {
        return {
          success: false,
          message: "Access denied",
          error: "You don't have permission to delete this building",
        };
      }

      // Check if building has apartments
      if (existingBuilding.apartments.length > 0) {
        return {
          success: false,
          message: "Cannot delete building",
          error: "Building has apartments. Please remove all apartments first.",
        };
      }

      await prisma.building.delete({
        where: { id: buildingId },
      });

      return {
        success: true,
        message: "Building deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting building:", error);
      return {
        success: false,
        message: "Failed to delete building",
        error: "Internal server error",
      };
    }
  }
}
