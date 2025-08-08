import { prisma } from "@/lib/prisma";
import type { Apartment, Prisma } from "@prisma/client";
import type {
  BulkCreationResult,
  CreateApartmentInput,
  CreateBulkApartmentsInput,
} from "@/lib/validations/apartment";
import { ErrorServiceResult, ServiceResult } from "@/types/api-response";

export type GetApartmentByIdResult = Prisma.ApartmentGetPayload<{
  include: {
    building: {
      select: {
        id: true;
        name: true;
        code: true;
        organizationId: true;
      };
    };
  };
}>;

export type GetApartmentsByBuildingResult = Prisma.ApartmentGetPayload<{
  include: {
    building: {
      select: {
        id: true;
        name: true;
        code: true;
      };
    };
    _count: {
      select: {
        apartmentResidents: true;
        waterMeters: true;
      };
    };
  };
}>;

export type GetApartmentsByOrganization = Prisma.ApartmentGetPayload<{
  include: {
    building: {
      select: {
        id: true;
        name: true;
        code: true;
      };
    };
    _count: {
      select: {
        apartmentResidents: true;
        waterMeters: true;
      };
    };
  };
}>;

export type BuildingApartmentStats = {
  totalApartments: number;
  occupiedApartments: number;
  vacantApartments: number;
  averageOccupancy: number;
  apartmentsByFloor: Record<
    string,
    {
      floor: number;
      totalApartments: number;
      occupiedApartments: number;
      vacantApartments: number;
      apartments: {
        id: string;
        number: string;
        isOccupied: boolean;
        occupantCount: number;
        surface: number | null;
      }[];
    }
  >;
};

export class ApartmentService {
  private includeBuildingDetails = {
    building: {
      select: {
        id: true,
        name: true,
        code: true,
        organizationId: true,
      },
    },
  };

  private includeApartmentCounts = {
    _count: {
      select: {
        apartmentResidents: true,
        waterMeters: true,
      },
    },
  };

  private notFoundError: ErrorServiceResult = {
    success: false,
    statusCode: 404,
    error: "Apartment not found",
  };

  private internalError: ErrorServiceResult = {
    success: false,
    statusCode: 500,
    error: "Internal server error",
  };

  /**
   * Create a new apartment
   */
  async createApartment(
    input: CreateApartmentInput
  ): Promise<ServiceResult<Apartment>> {
    try {
      // Verify building exists and belongs to organization
      const building = await prisma.building.findFirst({
        where: {
          id: input.buildingId,
          organizationId: input.organizationId,
        },
      });

      if (!building) {
        return {
          success: false,
          error: "Building not found or does not belong to your organization",
        };
      }

      // Check for duplicate apartment number in building
      const existingApartment = await prisma.apartment.findFirst({
        where: {
          buildingId: input.buildingId,
          number: input.number,
        },
      });

      if (existingApartment) {
        return {
          success: false,
          error:
            "An apartment with this number already exists in this building",
        };
      }

      // Validate floor against building's max floors
      if (input.floor > building.floors) {
        return {
          success: false,
          error: `Floor cannot exceed building's maximum floors (${building.floors})`,
        };
      }

      // Create apartment
      const apartment = await prisma.apartment.create({
        data: {
          number: input.number,
          floor: input.floor,
          buildingId: input.buildingId,
          isOccupied: input.isOccupied || false,
          occupantCount: input.occupantCount || 0,
          surface: input.surface,
          description: input.description,
        },
      });

      return {
        success: true,
        data: apartment,
      };
    } catch (error) {
      console.error("Error creating apartment:", error);
      return {
        success: false,
        error: "Failed to create apartment",
      };
    }
  }

  /**
   * Create multiple apartments in bulk
   */
  async createBulkApartments(
    input: CreateBulkApartmentsInput
  ): Promise<ServiceResult<BulkCreationResult>> {
    try {
      // Verify building exists and belongs to organization
      const building = await prisma.building.findFirst({
        where: {
          id: input.buildingId,
          organizationId: input.organizationId,
        },
      });

      if (!building) {
        return {
          success: false,
          error: "Building not found or does not belong to your organization",
        };
      }

      const results: BulkCreationResult = {
        success: true,
        created: [],
        errors: [],
        total: input.apartments.length,
        successCount: 0,
        errorCount: 0,
      };

      // Get existing apartment numbers to check for duplicates
      const existingApartments = await prisma.apartment.findMany({
        where: {
          buildingId: input.buildingId,
        },
        select: {
          number: true,
        },
      });

      const existingNumbers = new Set(
        existingApartments.map((apt) => apt.number)
      );

      // Process each apartment
      for (const apartmentData of input.apartments) {
        try {
          // Check for duplicate apartment number
          if (existingNumbers.has(apartmentData.number)) {
            results.errors.push({
              apartment: {
                number: apartmentData.number,
                floor: apartmentData.floor,
              },
              error: `Apartment number ${apartmentData.number} already exists in this building`,
            });
            results.errorCount++;
            continue;
          }

          // Validate floor against building's max floors
          if (apartmentData.floor > building.floors) {
            results.errors.push({
              apartment: {
                number: apartmentData.number,
                floor: apartmentData.floor,
              },
              error: `Floor ${apartmentData.floor} exceeds building's maximum floors (${building.floors})`,
            });
            results.errorCount++;
            continue;
          }

          // Create apartment
          const apartment = await prisma.apartment.create({
            data: {
              number: apartmentData.number,
              floor: apartmentData.floor,
              buildingId: input.buildingId,
              isOccupied: apartmentData.isOccupied || false,
              occupantCount: apartmentData.occupantCount || 0,
              surface: apartmentData.surface,
              description: apartmentData.description,
            },
            include: {
              building: true,
            },
          });

          results.created.push(apartment);
          results.successCount++;

          // Add to existing numbers to prevent duplicates within this batch
          existingNumbers.add(apartmentData.number);
        } catch (error) {
          results.errors.push({
            apartment: {
              number: apartmentData.number,
              floor: apartmentData.floor,
            },
            error: error instanceof Error ? error.message : "Unknown error",
          });
          results.errorCount++;
        }
      }

      // If no apartments were created, consider it a failure
      if (results.successCount === 0) {
        return {
          success: false,
          error: "No apartments could be created",
          data: results,
        };
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error("Error creating bulk apartments:", error);
      return {
        success: false,
        error: "Failed to create apartments",
      };
    }
  }

  /**
   * Get Apartment by ID with UserId Validation
   */

  async getApartmentByIdWithUserId(
    apartmentId: string,
    userId: string
  ): Promise<ServiceResult<GetApartmentByIdResult>> {
    try {
      const apartment = await prisma.apartment.findFirst({
        where: {
          id: apartmentId,
          apartmentResidents: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          building: this.includeBuildingDetails.building,
        },
      });
      if (!apartment) {
        return this.notFoundError;
      }
      return {
        success: true,
        data: apartment,
      };
    } catch (error) {
      console.error("Error fetching apartment:", error);
      return this.internalError;
    }
  }

  /**
   * Get all apartments for an organization
   */
  async getApartmentsByOrganization(
    organizationId: string
  ): Promise<ServiceResult<GetApartmentsByOrganization[]>> {
    try {
      const apartments = await prisma.apartment.findMany({
        where: {
          building: {
            organizationId: organizationId,
          },
        },
        include: {
          building: this.includeBuildingDetails.building,
          _count: this.includeApartmentCounts._count,
        },
        orderBy: [
          { building: { name: "asc" } },
          { floor: "asc" },
          { number: "asc" },
        ],
      });

      return {
        success: true,
        data: apartments,
      };
    } catch (error) {
      console.error("Error fetching apartments:", error);
      return this.internalError;
    }
  }

  /**
   * Update apartment
   */
  async updateApartment(
    apartmentId: string,
    organizationId: string,
    updateData: Partial<
      Omit<CreateApartmentInput, "buildingId" | "organizationId">
    >,
    userId: string,
    userRoles: string[]
  ): Promise<ServiceResult<Apartment>> {
    try {
      // Verify apartment exists and user has access
      const existingApartment = await this.getApartmentById(
        apartmentId,
        userId,
        userRoles
      );

      if (!existingApartment.success || !existingApartment.data) {
        return this.notFoundError;
      }

      // If updating apartment number, check for duplicates
      if (
        updateData.number &&
        updateData.number !== existingApartment.data.number
      ) {
        const duplicateApartment = await prisma.apartment.findFirst({
          where: {
            buildingId: existingApartment.data.buildingId,
            number: updateData.number,
            id: { not: apartmentId },
          },
        });

        if (duplicateApartment) {
          return {
            success: false,
            error:
              "An apartment with this number already exists in this building",
          };
        }
      }

      // If updating floor, validate against building's max floors
      if (updateData.floor) {
        const buildingDetails = await prisma.building.findUnique({
          where: { id: existingApartment.data.buildingId },
          select: { floors: true },
        });

        if (buildingDetails && updateData.floor > buildingDetails.floors) {
          return {
            success: false,
            error: `Floor cannot exceed building's maximum floors (${buildingDetails.floors})`,
          };
        }
      }

      // Update apartment
      const updatedApartment = await prisma.apartment.update({
        where: { id: apartmentId },
        data: updateData,
      });

      return {
        success: true,
        data: updatedApartment,
      };
    } catch (error) {
      console.error("Error updating apartment:", error);
      return this.internalError;
    }
  }

  /**
   * Delete apartment
   */
  async deleteApartment(
    apartmentId: string,
    organizationId: string,
    userId: string,
    userRoles: string[]
  ): Promise<ServiceResult<null>> {
    try {
      const canDeleteResult = await this.canDeleteApartment(
        apartmentId,
        organizationId,
        userId,
        userRoles
      );
      if (!canDeleteResult.success) {
        return canDeleteResult;
      }

      // Soft delete the apartment
      await prisma.apartment.update({
        where: { id: apartmentId },
        data: { deletedAt: new Date() },
      });

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      console.error("Error deleting apartment:", error);
      return this.internalError;
    }
  }

  private async canDeleteApartment(
    apartmentId: string,
    organizationId: string,
    userId: string,
    userRoles: string[]
  ): Promise<ServiceResult<null>> {
    // Verify apartment exists and user has access
    const existingApartment = await this.getApartmentById(
      apartmentId,
      userId,
      userRoles
    );

    if (!existingApartment.success || !existingApartment.data) {
      return this.notFoundError;
    }

    // Check if apartment has residents or water meters
    const apartmentDetails = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        _count: this.includeApartmentCounts._count,
      },
    });

    if (
      apartmentDetails &&
      apartmentDetails._count &&
      apartmentDetails._count.apartmentResidents! > 0
    ) {
      return {
        success: false,
        error: "Nu se poate șterge apartamentul cu rezidenți existenți",
      };
    }

    if (
      apartmentDetails &&
      apartmentDetails._count &&
      apartmentDetails._count.waterMeters! > 0
    ) {
      return {
        success: false,
        error: "Nu se poate șterge apartamentul cu contoare de apă existente",
      };
    }
    return {
      success: true,
      data: null,
    };
  }

  // ==========================================
  // NEW ACCESS-CONTROLLED METHODS
  // ==========================================

  /**
   * Get apartments by building with access control
   */
  async getApartmentsByBuilding(
    buildingId: string,
    userId: string,
    userRoles: string[]
  ): Promise<ServiceResult<GetApartmentsByBuildingResult[]>> {
    try {
      // Check if user is super admin (has full access)
      const isSuperAdmin = userRoles.includes("SUPER_ADMIN");

      let building;

      if (isSuperAdmin) {
        // Super admin can access any building's apartments
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

      const apartments = await prisma.apartment.findMany({
        where: {
          buildingId: buildingId,
          deletedAt: null,
        },
        include: {
          building: this.includeBuildingDetails.building,
          _count: this.includeApartmentCounts._count,
        },
        orderBy: [{ floor: "asc" }, { number: "asc" }],
      });

      return {
        success: true,
        data: apartments,
      };
    } catch (error) {
      console.error("Error fetching apartments by building:", error);
      return {
        success: false,
        error: "Eroare la încărcarea apartamentelor",
      };
    }
  }

  /**
   * Get apartment by ID with access control
   */
  async getApartmentById(
    apartmentId: string,
    userId: string,
    userRoles: string[]
  ): Promise<ServiceResult<GetApartmentByIdResult>> {
    try {
      // Check if user is super admin (has full access)
      const isSuperAdmin = userRoles.includes("SUPER_ADMIN");

      let apartment;

      if (isSuperAdmin) {
        // Super admin can access any apartment
        apartment = await prisma.apartment.findFirst({
          where: {
            id: apartmentId,
            deletedAt: null,
          },
          include: {
            building: this.includeBuildingDetails.building,
          },
        });
      } else {
        // Regular users can only access apartments in their organizations
        apartment = await prisma.apartment.findFirst({
          where: {
            id: apartmentId,
            deletedAt: null,
            building: {
              organization: {
                users: {
                  some: {
                    userId: userId,
                  },
                },
              },
            },
          },
          include: {
            building: this.includeBuildingDetails.building,
          },
        });
      }

      if (!apartment) {
        return {
          success: false,
          error: "Apartamentul nu a fost găsit sau nu aveți acces la el",
        };
      }

      return {
        success: true,
        data: apartment,
      };
    } catch (error) {
      console.error("Error fetching apartment:", error);
      return {
        success: false,
        error: "Eroare la încărcarea apartamentului",
      };
    }
  }

  /**
   * Get building apartment statistics with access control
   */
  async getBuildingApartmentStats(
    buildingId: string,
    userId: string,
    userRoles: string[]
  ): Promise<ServiceResult<BuildingApartmentStats>> {
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

      // Get all apartments for the building
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
        orderBy: [{ floor: "asc" }, { number: "asc" }],
      });

      // Calculate basic statistics
      const totalApartments = apartments.length;
      const occupiedApartments = apartments.filter(
        (apt) => apt.isOccupied
      ).length;
      const vacantApartments = totalApartments - occupiedApartments;

      // Calculate average occupancy (people per apartment)
      const totalOccupants = apartments.reduce(
        (sum, apt) => sum + apt.occupantCount,
        0
      );
      const averageOccupancy =
        totalApartments > 0 ? totalOccupants / totalApartments : 0;

      // Group apartments by floor with detailed statistics
      const apartmentsByFloor = apartments.reduce(
        (acc, apartment) => {
          const floorKey = apartment.floor.toString();

          if (!acc[floorKey]) {
            acc[floorKey] = {
              floor: apartment.floor,
              totalApartments: 0,
              occupiedApartments: 0,
              vacantApartments: 0,
              apartments: [],
            };
          }

          acc[floorKey].totalApartments++;

          if (apartment.isOccupied) {
            acc[floorKey].occupiedApartments++;
          } else {
            acc[floorKey].vacantApartments++;
          }

          acc[floorKey].apartments.push({
            id: apartment.id,
            number: apartment.number,
            isOccupied: apartment.isOccupied,
            occupantCount: apartment.occupantCount,
            surface: apartment.surface,
          });

          return acc;
        },
        {} as Record<string, any>
      );

      const stats: BuildingApartmentStats = {
        totalApartments,
        occupiedApartments,
        vacantApartments,
        averageOccupancy: Math.round(averageOccupancy * 100) / 100, // Round to 2 decimal places
        apartmentsByFloor,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching building apartment stats:", error);
      return {
        success: false,
        error: "Eroare la încărcarea statisticilor apartamentelor",
      };
    }
  }
}

export const apartmentService = new ApartmentService();
