import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";
import type {
  ServiceResult,
  InviteCodeWithDetails,
} from "@/types/invite-codes.types";
import {
  CreateInviteCodeSchema,
  UseInviteCodeSchema,
  type CreateInviteCodeInput,
  type UseInviteCodeInput,
} from "@/lib/validations/invite-codes.validations";
import { CODE_GENERATION_CONFIG } from "@/lib/constants/invite-codes.constants";

export class InviteCodesService {
  /**
   * Generate a random invite code
   */
  private static generateCode(): string {
    const { CHARACTERS, LENGTH } = CODE_GENERATION_CONFIG;
    let result = "";
    for (let i = 0; i < LENGTH; i++) {
      result += CHARACTERS.charAt(
        Math.floor(Math.random() * CHARACTERS.length)
      );
    }
    return result;
  }

  /**
   * Create a new invite code for an apartment
   */
  static async createInviteCode(
    data: CreateInviteCodeInput,
    administratorId: string
  ): Promise<ServiceResult<InviteCodeWithDetails>> {
    try {
      // Validate input
      const validatedData = CreateInviteCodeSchema.parse(data);

      // Check if apartment exists and belongs to this administrator
      const apartment = await prisma.apartment.findFirst({
        where: {
          id: validatedData.apartmentId,
          building: {
            administratorId,
          },
        },
        include: {
          building: true,
          inviteCode: true,
        },
      });

      if (!apartment) {
        return {
          success: false,
          error: "Apartamentul nu a fost găsit sau nu aveți permisiuni",
          code: "APARTMENT_NOT_FOUND",
        };
      }

      // Check if apartment already has an active invite code
      if (apartment.inviteCode && apartment.inviteCode.status === "ACTIVE") {
        return {
          success: false,
          error: "Apartamentul are deja un cod de invitație activ",
          code: "CODE_ALREADY_EXISTS",
        };
      }

      // Generate unique code
      let code: string;
      let attempts = 0;
      do {
        code = this.generateCode();
        attempts++;
        if (attempts > CODE_GENERATION_CONFIG.MAX_ATTEMPTS) {
          return {
            success: false,
            error: "Nu s-a putut genera un cod unic",
            code: "CODE_GENERATION_FAILED",
          };
        }
      } while (await prisma.inviteCode.findUnique({ where: { code } }));

      // Cancel existing code if any
      if (apartment.inviteCode) {
        await prisma.inviteCode.update({
          where: { id: apartment.inviteCode.id },
          data: { status: "CANCELLED" },
        });
      }

      // Create new invite code
      const inviteCode = await prisma.inviteCode.create({
        data: {
          code,
          apartmentId: validatedData.apartmentId,
          createdBy: administratorId,
          expiresAt: validatedData.expiresAt,
        },
        include: {
          apartment: {
            include: {
              building: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
            },
          },
          usedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        data: inviteCode as InviteCodeWithDetails,
      };
    } catch (error) {
      console.error("Error in InviteCodesService.createInviteCode:", error);

      if (error instanceof ZodError) {
        return {
          success: false,
          error: "Datele de intrare sunt invalide",
          code: "VALIDATION_FAILED",
          details: error.format(),
        };
      }

      return {
        success: false,
        error: "Eroare internă la crearea codului de invitație",
        code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Validate and redeem an invite code
   */
  static async redeemInviteCode(
    data: UseInviteCodeInput
  ): Promise<ServiceResult<InviteCodeWithDetails>> {
    try {
      // Validate input
      const validatedData = UseInviteCodeSchema.parse(data);

      // Find the invite code
      const inviteCode = await prisma.inviteCode.findUnique({
        where: { code: validatedData.code },
        include: {
          apartment: {
            include: {
              building: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
            },
          },
        },
      });

      if (!inviteCode) {
        return {
          success: false,
          error: "Codul de invitație nu este valid",
          code: "INVALID_CODE",
        };
      }

      // Check if code is active
      if (inviteCode.status !== "ACTIVE") {
        return {
          success: false,
          error: "Codul de invitație nu mai este activ",
          code: "CODE_NOT_ACTIVE",
        };
      }

      // Check if code is expired
      if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
        // Mark as expired
        await prisma.inviteCode.update({
          where: { id: inviteCode.id },
          data: { status: "EXPIRED" },
        });

        return {
          success: false,
          error: "Codul de invitație a expirat",
          code: "CODE_EXPIRED",
        };
      }

      // Check if apartment already has an owner
      if (inviteCode.apartment.ownerId) {
        return {
          success: false,
          error: "Apartamentul are deja un proprietar",
          code: "APARTMENT_ALREADY_OWNED",
        };
      }

      // Use the code and assign apartment to user
      const [updatedCode] = await prisma.$transaction([
        // Mark code as used
        prisma.inviteCode.update({
          where: { id: inviteCode.id },
          data: {
            status: "USED",
            usedBy: validatedData.userId,
            usedAt: new Date(),
          },
          include: {
            apartment: {
              include: {
                building: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                  },
                },
              },
            },
            usedByUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        // Assign apartment to user's owner profile
        prisma.apartment.update({
          where: { id: inviteCode.apartmentId },
          data: {
            owner: {
              connectOrCreate: {
                where: { userId: validatedData.userId },
                create: { userId: validatedData.userId },
              },
            },
          },
        }),
      ]);

      return {
        success: true,
        data: updatedCode as InviteCodeWithDetails,
      };
    } catch (error) {
      console.error("Error in InviteCodesService.redeemInviteCode:", error);

      if (error instanceof ZodError) {
        return {
          success: false,
          error: "Datele de intrare sunt invalide",
          code: "VALIDATION_FAILED",
          details: error.format(),
        };
      }

      return {
        success: false,
        error: "Eroare internă la folosirea codului de invitație",
        code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Get invite codes for an administrator
   */
  static async getInviteCodesByAdministrator(
    administratorId: string
  ): Promise<ServiceResult<InviteCodeWithDetails[]>> {
    try {
      const inviteCodes = await prisma.inviteCode.findMany({
        where: { createdBy: administratorId },
        include: {
          apartment: {
            include: {
              building: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
            },
          },
          usedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: inviteCodes as InviteCodeWithDetails[],
      };
    } catch (error) {
      console.error(
        "Error in InviteCodesService.getInviteCodesByAdministrator:",
        error
      );

      return {
        success: false,
        error: "Eroare internă la obținerea codurilor de invitație",
        code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Cancel an invite code
   */
  static async cancelInviteCode(
    codeId: string,
    administratorId: string
  ): Promise<ServiceResult<InviteCodeWithDetails>> {
    try {
      // Find and update the code
      const inviteCode = await prisma.inviteCode.findFirst({
        where: {
          id: codeId,
          createdBy: administratorId,
        },
      });

      if (!inviteCode) {
        return {
          success: false,
          error: "Codul de invitație nu a fost găsit",
          code: "CODE_NOT_FOUND",
        };
      }

      if (inviteCode.status !== "ACTIVE") {
        return {
          success: false,
          error: "Codul de invitație nu poate fi anulat",
          code: "CODE_NOT_CANCELLABLE",
        };
      }

      const updatedCode = await prisma.inviteCode.update({
        where: { id: codeId },
        data: { status: "CANCELLED" },
        include: {
          apartment: {
            include: {
              building: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
            },
          },
          usedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        data: updatedCode as InviteCodeWithDetails,
      };
    } catch (error) {
      console.error("Error in InviteCodesService.cancelInviteCode:", error);

      return {
        success: false,
        error: "Eroare internă la anularea codului de invitație",
        code: "INTERNAL_ERROR",
      };
    }
  }
}
