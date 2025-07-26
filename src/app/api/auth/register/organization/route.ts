import { NextRequest } from "next/server";
import { organizationCreationSchema } from "@/lib/validations/auth";
import { OrganizationService } from "@/services/organization.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import {
  toSuccessApiResponse,
  errorApiResultResponse,
  zodErrorToNextResponse,
  internalServerErrorResponse,
} from "@/lib/withAuth";

export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorApiResultResponse({
        success: false,
        error: "Nu sunteți autentificat",
        statusCode: 401,
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = organizationCreationSchema.parse(body);

    // Create the organization
    const createResult =
      await OrganizationService.createOrganization(validatedData);
    if (!createResult.success) {
      return errorApiResultResponse(createResult);
    }

    // At this point we know createResult.success is true and data exists
    const organization = createResult.data!;

    // Assign current user to the organization as administrator
    const assignResult = await OrganizationService.assignUserToOrganization(
      session.user.id,
      organization.id,
      "ADMINISTRATOR"
    );

    if (!assignResult.success) {
      // Rollback organization creation if user assignment fails
      await OrganizationService.deleteOrganization(organization.id);
      return errorApiResultResponse({
        success: false,
        error: assignResult.error || "Eroare la asignarea utilizatorului",
        statusCode: 500,
      });
    }

    // Generate payment link if subscription plan is provided
    let paymentLink = null;
    if (validatedData.subscriptionPlanId) {
      const paymentResult = await OrganizationService.generatePaymentLink({
        organizationId: organization.id,
        subscriptionPlanId: validatedData.subscriptionPlanId,
        userId: session.user.id,
      });

      if (paymentResult.success) {
        paymentLink = paymentResult.data;
      }
    }

    return toSuccessApiResponse({
      success: true,
      data: {
        organization,
        paymentLink,
      },
      message: "Organizația a fost creată cu succes",
    });
  } catch (error) {
    console.error("Error in organization registration:", error);

    if (error instanceof z.ZodError) {
      return zodErrorToNextResponse(error);
    }

    return internalServerErrorResponse();
  }
}
