import { prisma } from "@/lib/prisma";
import type { Apartment } from "@prisma/client";
import type { CreateApartmentFormData } from "@/lib/validations/apartment";

type CreateApartmentInput = CreateApartmentFormData & {
  organizationId: string;
};

type CreateBulkApartmentsInput = {
  buildingId: string;
  organizationId: string;
  apartments: {
    number: string;
    floor: number;
    isOccupied?: boolean;
    occupantCount?: number;
    surface?: number;
    description?: string;
  }[];
};

type BulkCreationResult = {
  success: boolean;
  created: Apartment[];
  errors: {
    apartment: {
      number: string;
      floor: number;
    };
    error: string;
  }[];
  total: number;
  successCount: number;
  errorCount: number;
};

type ServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type ApartmentWithBuilding = Apartment & {
  building: {
    id: string;
    name: string;
    code: string;
    organizationId: string;
  };
};

type ApartmentWithCounts = Apartment & {
  building: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    apartmentResidents: number;
    waterMeters: number;
  };
};

export class ApartmentService {
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
   * Get apartment by ID with organization validation
   */
  async getApartmentById(
    apartmentId: string,
    organizationId: string
  ): Promise<ServiceResult<ApartmentWithBuilding>> {
    try {
      const apartment = await prisma.apartment.findFirst({
        where: {
          id: apartmentId,
          building: {
            organizationId: organizationId,
          },
        },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              code: true,
              organizationId: true,
            },
          },
        },
      });

      if (!apartment) {
        return {
          success: false,
          error: "Apartment not found",
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
        error: "Failed to fetch apartment",
      };
    }
  }

  /**
   * Get apartments by building with organization validation
   */
  async getApartmentsByBuilding(
    buildingId: string,
    organizationId: string
  ): Promise<ServiceResult<ApartmentWithCounts[]>> {
    try {
      // Verify building belongs to organization
      const building = await prisma.building.findFirst({
        where: {
          id: buildingId,
          organizationId: organizationId,
        },
      });

      if (!building) {
        return {
          success: false,
          error: "Building not found or does not belong to your organization",
        };
      }

      const apartments = await prisma.apartment.findMany({
        where: {
          buildingId: buildingId,
        },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              apartmentResidents: true,
              waterMeters: true,
            },
          },
        },
        orderBy: [{ floor: "asc" }, { number: "asc" }],
      });

      return {
        success: true,
        data: apartments,
      };
    } catch (error) {
      console.error("Error fetching apartments:", error);
      return {
        success: false,
        error: "Failed to fetch apartments",
      };
    }
  }

  /**
   * Get all apartments for an organization
   */
  async getApartmentsByOrganization(
    organizationId: string
  ): Promise<ServiceResult<ApartmentWithCounts[]>> {
    try {
      const apartments = await prisma.apartment.findMany({
        where: {
          building: {
            organizationId: organizationId,
          },
        },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              apartmentResidents: true,
              waterMeters: true,
            },
          },
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
      return {
        success: false,
        error: "Failed to fetch apartments",
      };
    }
  }

  /**
   * Update apartment
   */
  async updateApartment(
    apartmentId: string,
    organizationId: string,
    updateData: Partial<CreateApartmentFormData>
  ): Promise<ServiceResult<Apartment>> {
    try {
      // Verify apartment exists and belongs to organization
      const existingApartment = await this.getApartmentById(
        apartmentId,
        organizationId
      );

      if (!existingApartment.success || !existingApartment.data) {
        return {
          success: false,
          error: "Apartment not found",
        };
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
      return {
        success: false,
        error: "Failed to update apartment",
      };
    }
  }

  /**
   * Delete apartment
   */
  async deleteApartment(
    apartmentId: string,
    organizationId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Verify apartment exists and belongs to organization
      const existingApartment = await this.getApartmentById(
        apartmentId,
        organizationId
      );

      if (!existingApartment.success || !existingApartment.data) {
        return {
          success: false,
          error: "Apartment not found",
        };
      }

      // Check if apartment has residents or water meters
      const apartmentDetails = await prisma.apartment.findUnique({
        where: { id: apartmentId },
        include: {
          _count: {
            select: {
              apartmentResidents: true,
              waterMeters: true,
            },
          },
        },
      });

      if (
        apartmentDetails &&
        apartmentDetails._count &&
        apartmentDetails._count.apartmentResidents! > 0
      ) {
        return {
          success: false,
          error: "Cannot delete apartment with existing residents",
        };
      }

      if (
        apartmentDetails &&
        apartmentDetails._count &&
        apartmentDetails._count.waterMeters! > 0
      ) {
        return {
          success: false,
          error: "Cannot delete apartment with existing water meters",
        };
      }

      // Soft delete the apartment
      await prisma.apartment.update({
        where: { id: apartmentId },
        data: { deletedAt: new Date() },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting apartment:", error);
      return {
        success: false,
        error: "Failed to delete apartment",
      };
    }
  }
}

export const apartmentService = new ApartmentService();
