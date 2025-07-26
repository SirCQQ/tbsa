import { prisma } from "@/lib/prisma";
import type { OrganizationCreationData } from "@/lib/validations/auth";
import { ServiceResult } from "@/types/api-response";
import type { Organization, Prisma, SubscriptionPlan } from "@prisma/client";

export type OrganizationWithSubscription = Prisma.OrganizationGetPayload<{
  include: {
    subscriptionPlan: true;
  };
}>;

export class OrganizationService {
  /**
   * Create a new organization
   */
  static async createOrganization(
    data: OrganizationCreationData
  ): Promise<ServiceResult<Organization>> {
    try {
      // Check if organization code already exists
      const existingOrg = await prisma.organization.findUnique({
        where: { code: data.code },
      });

      if (existingOrg) {
        return {
          success: false,
          error: "O organizație cu acest cod există deja",
        };
      }

      // Create the organization
      const organization = await prisma.organization.create({
        data,
      });

      return {
        success: true,
        data: organization,
      };
    } catch (error) {
      console.error("Error creating organization:", error);
      return {
        success: false,
        error: "Eroare la crearea organizației",
      };
    }
  }

  /**
   * Get organization by ID
   */
  static async getOrganizationById(
    id: string
  ): Promise<ServiceResult<OrganizationWithSubscription>> {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
          subscriptionPlan: true,
        },
      });

      if (!organization) {
        return {
          success: false,
          error: "Organizația nu a fost găsită",
        };
      }

      return {
        success: true,
        data: organization,
      };
    } catch (error) {
      console.error("Error fetching organization:", error);
      return {
        success: false,
        error: "Eroare la încărcarea organizației",
      };
    }
  }

  /**
   * Get organization by code
   */
  static async getOrganizationByCode(
    code: string
  ): Promise<ServiceResult<OrganizationWithSubscription>> {
    try {
      const organization = await prisma.organization.findUnique({
        where: { code },
        include: {
          subscriptionPlan: true,
        },
      });

      if (!organization) {
        return {
          success: false,
          error: "Organizația nu a fost găsită",
        };
      }

      return {
        success: true,
        data: organization,
      };
    } catch (error) {
      console.error("Error fetching organization by code:", error);
      return {
        success: false,
        error: "Eroare la încărcarea organizației",
      };
    }
  }

  /**
   * Update organization
   */
  static async updateOrganization(
    id: string,
    data: Partial<OrganizationCreationData>
  ): Promise<ServiceResult<Organization>> {
    try {
      // If code is being updated, check for uniqueness
      if (data.code) {
        const existingOrg = await prisma.organization.findFirst({
          where: {
            code: data.code,
            NOT: { id },
          },
        });

        if (existingOrg) {
          return {
            success: false,
            error: "O organizație cu acest cod există deja",
          };
        }
      }

      const organization = await prisma.organization.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.code && { code: data.code }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.subscriptionPlanId !== undefined && {
            subscriptionPlanId: data.subscriptionPlanId,
          }),
        },
      });

      return {
        success: true,
        data: organization,
      };
    } catch (error) {
      console.error("Error updating organization:", error);
      return {
        success: false,
        error: "Eroare la actualizarea organizației",
      };
    }
  }

  /**
   * Delete organization (soft delete)
   */
  static async deleteOrganization(
    id: string
  ): Promise<ServiceResult<Organization>> {
    try {
      const organization = await prisma.organization.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        data: organization,
      };
    } catch (error) {
      console.error("Error deleting organization:", error);
      return {
        success: false,
        error: "Eroare la ștergerea organizației",
      };
    }
  }

  /**
   * Check if organization code is available
   */
  static async isCodeAvailable(code: string): Promise<ServiceResult<boolean>> {
    try {
      const existingOrg = await prisma.organization.findUnique({
        where: { code },
      });

      return {
        success: true,
        data: !existingOrg,
      };
    } catch (error) {
      console.error("Error checking code availability:", error);
      return {
        success: false,
        error: "Eroare la verificarea codului",
      };
    }
  }

  /**
   * Assign user to organization with role
   */
  static async assignUserToOrganization(
    userId: string,
    organizationId: string,
    roleCode: string = "ADMINISTRATOR"
  ): Promise<ServiceResult<{ userOrganization: any; userRole: any }>> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Check if user already belongs to this organization
        const existingAssignment = await tx.userOrganization.findUnique({
          where: {
            userId_organizationId: {
              userId,
              organizationId,
            },
          },
        });

        if (existingAssignment) {
          throw new Error("Utilizatorul este deja asignat acestei organizații");
        }

        // Get or create the role
        let role = await tx.role.findUnique({
          where: { code: roleCode },
        });

        if (!role) {
          role = await tx.role.create({
            data: {
              name: roleCode,
              code: roleCode,
              description: `${roleCode} role`,
              isSystem: true,
            },
          });
        }

        // Create user-organization association
        const userOrganization = await tx.userOrganization.create({
          data: {
            userId,
            organizationId,
          },
        });

        // Assign role to user
        const existingUserRole = await tx.userRole.findUnique({
          where: {
            userId_roleId: {
              userId,
              roleId: role.id,
            },
          },
        });

        let userRole;
        if (!existingUserRole) {
          userRole = await tx.userRole.create({
            data: {
              userId,
              roleId: role.id,
            },
          });
        } else {
          userRole = existingUserRole;
        }

        // Associate role with organization if not already associated
        const existingOrgRole = await tx.organizationRole.findUnique({
          where: {
            organizationId_roleId: {
              organizationId,
              roleId: role.id,
            },
          },
        });

        if (!existingOrgRole) {
          await tx.organizationRole.create({
            data: {
              organizationId,
              roleId: role.id,
            },
          });
        }

        return { userOrganization, userRole };
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error assigning user to organization:", error);

      let errorMessage = "Eroare la asignarea utilizatorului";
      if (error instanceof Error && error.message.includes("deja asignat")) {
        errorMessage = "Utilizatorul este deja asignat acestei organizații";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Generate payment link for organization subscription
   */
  static async generatePaymentLink(data: {
    organizationId: string;
    subscriptionPlanId: string;
    userId: string;
  }): Promise<ServiceResult<string>> {
    try {
      // Get subscription plan details
      const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: data.subscriptionPlanId },
      });

      if (!subscriptionPlan) {
        return {
          success: false,
          error: "Planul de abonament nu a fost găsit",
        };
      }

      // Get organization details
      const organization = await prisma.organization.findUnique({
        where: { id: data.organizationId },
      });

      if (!organization) {
        return {
          success: false,
          error: "Organizația nu a fost găsită",
        };
      }

      // Generate payment session/link
      // This is a placeholder - replace with actual payment provider integration
      // Example integrations: Stripe, PayPal, Square, etc.
      const paymentSessionId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In a real implementation, you would:
      // 1. Create a payment session with your payment provider
      // 2. Include organization and subscription details
      // 3. Set success/cancel URLs
      // 4. Return the checkout URL

      // For now, returning a mock payment URL
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const paymentUrl = `${baseUrl}/payment/checkout?session_id=${paymentSessionId}&org_id=${data.organizationId}&plan_id=${data.subscriptionPlanId}`;

      // Store payment session info for later verification
      // You might want to create a PaymentSession model in your schema
      console.log(
        `Payment session created: ${paymentSessionId} for organization: ${organization.name}`
      );

      return {
        success: true,
        data: paymentUrl,
      };
    } catch (error) {
      console.error("Error generating payment link:", error);
      return {
        success: false,
        error: "Eroare la generarea link-ului de plată",
      };
    }
  }

  /**
   * Get organization statistics
   */
  static async getOrganizationStats(id: string): Promise<
    ServiceResult<{
      buildingsCount: number;
      apartmentsCount: number;
      usersCount: number;
    }>
  > {
    try {
      const [buildingsCount, apartmentsCount, usersCount] = await Promise.all([
        prisma.building.count({
          where: {
            organizationId: id,
            deletedAt: null,
          },
        }),
        prisma.apartment.count({
          where: {
            building: {
              organizationId: id,
              deletedAt: null,
            },
            deletedAt: null,
          },
        }),
        prisma.userOrganization.count({
          where: { organizationId: id },
        }),
      ]);

      return {
        success: true,
        data: {
          buildingsCount,
          apartmentsCount,
          usersCount,
        },
      };
    } catch (error) {
      console.error("Error fetching organization stats:", error);
      return {
        success: false,
        error: "Eroare la încărcarea statisticilor",
      };
    }
  }
}
