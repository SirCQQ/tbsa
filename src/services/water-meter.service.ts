import { prisma } from "@/lib/prisma";
import type { WaterMeter, WaterReading } from "@prisma/client";
import type {
  CreateWaterMeterFormData,
  UpdateWaterMeterFormData,
  BulkCreateWaterMetersFormData,
} from "@/lib/validations/water-meter";
import { ServiceResult } from "@/types/api-response";

export type WaterMeterWithReadings = WaterMeter & {
  waterReadings: WaterReading[];
  _count: {
    waterReadings: number;
  };
};

export type WaterMeterListItem = WaterMeter & {
  _count: {
    waterReadings: number;
  };
  latestReading?: {
    value: number;
    readingDate: Date;
    isApproved: boolean;
  };
};

export class WaterMeterService {
  /**
   * Get all water meters for a specific apartment
   */
  static async getWaterMetersByApartment(
    apartmentId: string
  ): Promise<ServiceResult<WaterMeterListItem[]>> {
    try {
      // First verify apartment exists and get building info for organization check
      const apartment = await prisma.apartment.findUnique({
        where: { id: apartmentId },
        include: {
          building: {
            select: {
              organizationId: true,
            },
          },
        },
      });

      if (!apartment) {
        return {
          success: false,
          error: "Apartamentul nu a fost găsit",
        };
      }

      const waterMeters = await prisma.waterMeter.findMany({
        where: {
          apartmentId,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              waterReadings: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
          waterReadings: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              readingDate: "desc",
            },
            take: 1,
            select: {
              value: true,
              readingDate: true,
              isApproved: true,
            },
          },
        },
        orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      });

      const formattedWaterMeters: WaterMeterListItem[] = waterMeters.map(
        (meter) => ({
          ...meter,
          latestReading: meter.waterReadings[0] || undefined,
        })
      );

      return {
        success: true,
        data: formattedWaterMeters,
      };
    } catch (error) {
      console.error("Error fetching water meters:", error);
      return {
        success: false,
        error: "A apărut o eroare la încărcarea contoarelor",
      };
    }
  }

  /**
   * Get a specific water meter by ID
   */
  static async getWaterMeterById(
    id: string
  ): Promise<ServiceResult<WaterMeterWithReadings>> {
    try {
      const waterMeter = await prisma.waterMeter.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              waterReadings: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
          waterReadings: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              readingDate: "desc",
            },
            include: {
              submittedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              approvedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!waterMeter) {
        return {
          success: false,
          error: "Contorul nu a fost găsit",
        };
      }

      return {
        success: true,
        data: waterMeter,
      };
    } catch (error) {
      console.error("Error fetching water meter:", error);
      return {
        success: false,
        error: "A apărut o eroare la încărcarea contorului",
      };
    }
  }

  /**
   * Create a new water meter
   */
  static async createWaterMeter(
    data: CreateWaterMeterFormData,
    userId?: string
  ): Promise<ServiceResult<WaterMeter>> {
    try {
      // Check if apartment exists and get building info for organization check
      const apartment = await prisma.apartment.findUnique({
        where: { id: data.apartmentId },
        include: {
          building: {
            select: {
              organizationId: true,
            },
          },
        },
      });

      if (!apartment) {
        return {
          success: false,
          error: "Apartamentul nu a fost găsit",
        };
      }

      // Check if serial number is already in use within the organization
      const existingMeter = await prisma.waterMeter.findFirst({
        where: {
          serialNumber: data.serialNumber,
          apartment: {
            building: {
              organizationId: apartment.building.organizationId,
            },
          },
          deletedAt: null,
        },
      });

      if (existingMeter) {
        return {
          success: false,
          error: "Un contor cu acest număr de serie există deja în organizație",
        };
      }

      // Create the water meter within a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the water meter
        const waterMeter = await tx.waterMeter.create({
          data: {
            serialNumber: data.serialNumber,
            apartmentId: data.apartmentId,
            location: data.location || null,
            brand: data.brand || null,
            model: data.model || null,
            isActive: data.isActive ?? true,
          },
        });

        // Create initial reading if initial value is provided and > 0 and we have a valid user
        if (data.initialValue && data.initialValue > 0 && userId) {
          await tx.waterReading.create({
            data: {
              waterMeterId: waterMeter.id,
              value: data.initialValue,
              notes: "Citire inițială la instalarea contorului",
              isApproved: true,
              submittedById: userId,
              approvedById: userId,
              readingDate: new Date(),
            },
          });
        }

        return waterMeter;
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log("=== Water Meter Creation Error ===");
      console.log("Error type:", typeof error);
      console.log("Error stringified:", JSON.stringify(error));
      console.log("Error value:", error);
      console.log("===================================");
      console.error("Error creating water meter:", error ?? "Unknown error");

      // Handle unique constraint violation
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        return {
          success: false,
          error: "Un contor cu acest număr de serie există deja",
        };
      }

      return {
        success: false,
        error: "A apărut o eroare la crearea contorului",
      };
    }
  }

  /**
   * Create multiple water meters in bulk
   */
  static async bulkCreateWaterMeters(
    data: BulkCreateWaterMetersFormData,
    userId?: string
  ): Promise<ServiceResult<WaterMeter[]>> {
    try {
      // Check if apartment exists
      const apartment = await prisma.apartment.findUnique({
        where: { id: data.apartmentId },
        include: {
          building: {
            select: {
              organizationId: true,
            },
          },
        },
      });

      if (!apartment) {
        return {
          success: false,
          error: "Apartamentul nu a fost găsit",
        };
      }

      // Check for duplicate serial numbers within the batch
      const serialNumbers = data.waterMeters.map((meter) => meter.serialNumber);
      const uniqueSerialNumbers = new Set(serialNumbers);
      if (uniqueSerialNumbers.size !== serialNumbers.length) {
        return {
          success: false,
          error: "Numerele de serie trebuie să fie unice",
        };
      }

      // Check if any serial numbers already exist in the organization
      const existingMeters = await prisma.waterMeter.findMany({
        where: {
          serialNumber: {
            in: serialNumbers,
          },
          apartment: {
            building: {
              organizationId: apartment.building.organizationId,
            },
          },
          deletedAt: null,
        },
        select: {
          serialNumber: true,
        },
      });

      if (existingMeters.length > 0) {
        const existingSerials = existingMeters.map(
          (meter) => meter.serialNumber
        );
        return {
          success: false,
          error: `Următoarele numere de serie există deja: ${existingSerials.join(", ")}`,
        };
      }

      // Create all water meters within a transaction
      const result = await prisma.$transaction(async (tx) => {
        const createdMeters: WaterMeter[] = [];

        for (const meterData of data.waterMeters) {
          const waterMeter = await tx.waterMeter.create({
            data: {
              serialNumber: meterData.serialNumber,
              apartmentId: data.apartmentId,
              location: meterData.location || null,
              brand: meterData.brand || null,
              model: meterData.model || null,
              isActive: meterData.isActive ?? true,
            },
          });

          // Create initial reading if initial value is provided and > 0 and we have a valid user
          if (meterData.initialValue && meterData.initialValue > 0 && userId) {
            await tx.waterReading.create({
              data: {
                waterMeterId: waterMeter.id,
                value: meterData.initialValue,
                notes: "Citire inițială la instalarea contorului",
                isApproved: true,
                submittedById: userId,
                approvedById: userId,
                readingDate: new Date(),
              },
            });
          }

          createdMeters.push(waterMeter);
        }

        return createdMeters;
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log("\n\n\n\n\n\n", { error }, "\n\n\n\n\n\n\n");
      console.error("Error creating water meters:", error ?? "Unknown error");
      return {
        success: false,
        error: "A apărut o eroare la crearea contoarelor",
      };
    }
  }

  /**
   * Update an existing water meter
   */
  static async updateWaterMeter(
    id: string,
    data: UpdateWaterMeterFormData
  ): Promise<ServiceResult<WaterMeter>> {
    try {
      // Check if water meter exists
      const existingMeter = await prisma.waterMeter.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          apartment: {
            include: {
              building: {
                select: {
                  organizationId: true,
                },
              },
            },
          },
        },
      });

      if (!existingMeter) {
        return {
          success: false,
          error: "Contorul nu a fost găsit",
        };
      }

      // If updating serial number, check for duplicates
      if (
        data.serialNumber &&
        data.serialNumber !== existingMeter.serialNumber
      ) {
        const duplicateMeter = await prisma.waterMeter.findFirst({
          where: {
            serialNumber: data.serialNumber,
            apartment: {
              building: {
                organizationId: existingMeter.apartment.building.organizationId,
              },
            },
            deletedAt: null,
            id: {
              not: id,
            },
          },
        });

        if (duplicateMeter) {
          return {
            success: false,
            error:
              "Un contor cu acest număr de serie există deja în organizație",
          };
        }
      }

      const updatedMeter = await prisma.waterMeter.update({
        where: { id },
        data: {
          ...(data.serialNumber && { serialNumber: data.serialNumber }),
          ...(data.location !== undefined && {
            location: data.location || null,
          }),
          ...(data.brand !== undefined && { brand: data.brand || null }),
          ...(data.model !== undefined && { model: data.model || null }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      return {
        success: true,
        data: updatedMeter,
      };
    } catch (error) {
      console.error("Error updating water meter:", error);
      return {
        success: false,
        error: "A apărut o eroare la actualizarea contorului",
      };
    }
  }

  /**
   * Delete a water meter (soft delete)
   */
  static async deleteWaterMeter(id: string): Promise<ServiceResult<null>> {
    try {
      // Check if water meter exists and has readings
      const waterMeter = await prisma.waterMeter.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              waterReadings: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      if (!waterMeter) {
        return {
          success: false,
          error: "Contorul nu a fost găsit",
        };
      }

      // Check if meter has readings
      if (waterMeter._count.waterReadings > 0) {
        return {
          success: false,
          error:
            "Nu se poate șterge contorul deoarece are citiri asociate. Dezactivați-l în schimb.",
        };
      }

      // Soft delete the water meter
      await prisma.waterMeter.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      console.error("Error deleting water meter:", error);
      return {
        success: false,
        error: "A apărut o eroare la ștergerea contorului",
      };
    }
  }

  /**
   * Toggle water meter active status
   */
  static async toggleWaterMeterStatus(
    id: string,
    isActive: boolean
  ): Promise<ServiceResult<WaterMeter>> {
    try {
      const waterMeter = await prisma.waterMeter.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!waterMeter) {
        return {
          success: false,
          error: "Contorul nu a fost găsit",
        };
      }

      const updatedMeter = await prisma.waterMeter.update({
        where: { id },
        data: {
          isActive,
        },
      });

      return {
        success: true,
        data: updatedMeter,
      };
    } catch (error) {
      console.error("Error toggling water meter status:", error);
      return {
        success: false,
        error: "A apărut o eroare la schimbarea statusului contorului",
      };
    }
  }
}
