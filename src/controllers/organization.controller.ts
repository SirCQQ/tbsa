import {
  errorApiResultResponse,
  Handler,
  internalServerErrorResponse,
  toSuccessApiResponse,
} from "@/lib/withAuth";
import {
  OrganizationService,
  type UserOrganizationMembership,
} from "@/services/organization.service";

export const getUserOrganizations: Handler<Response> = async (
  request,
  session
): Promise<Response> => {
  try {
    // Get user organizations using the service
    const result = await OrganizationService.getUserOrganizations(
      session.user.id
    );

    if (!result.success) {
      return errorApiResultResponse(
        result,
        "Nu s-au găsit organizații pentru acest utilizator"
      );
    }

    // Format response to return only organization data with membership info
    const formattedOrganizations = result.data!.map(
      (membership: UserOrganizationMembership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        code: membership.organization.code,
        description: membership.organization.description,
        address: membership.organization.address,
        subscriptionPlan: membership.organization.subscriptionPlan,
        membershipId: membership.id,
        joinedAt: membership.createdAt,
        role: membership.permissionId ? "CUSTOM" : "MEMBER", // Simplified for now
      })
    );

    return toSuccessApiResponse(
      {
        success: true,
        data: formattedOrganizations,
      },
      200
    );
  } catch (error) {
    console.error(
      "User organizations fetch API error:",
      error instanceof Error ? error.message : String(error)
    );
    return internalServerErrorResponse();
  }
};

export const getOrganizationById: Handler<Response> = async (
  request,
  session,
  context
): Promise<Response> => {
  try {
    const { params } = context || {};
    if (!params) {
      return errorApiResultResponse(
        { success: false, error: "Missing parameters" },
        "Parametrii lipsesc"
      );
    }

    const { orgId } = await params;

    // Get organization details (without statistics)
    const result = await OrganizationService.getOrganizationById(orgId);

    if (!result.success) {
      return errorApiResultResponse(
        result,
        "Nu s-au găsit detaliile organizației"
      );
    }

    return toSuccessApiResponse(result, 200);
  } catch (error) {
    console.error(
      "Organization details fetch API error:",
      error instanceof Error ? error.message : String(error)
    );
    return internalServerErrorResponse();
  }
};

export const getOrganizationStats: Handler<Response> = async (
  request,
  session,
  context
): Promise<Response> => {
  try {
    const { params } = context || {};
    if (!params) {
      return errorApiResultResponse(
        { success: false, error: "Missing parameters" },
        "Parametrii lipsesc"
      );
    }

    const { orgId } = await params;

    // Get organization statistics
    const result = await OrganizationService.getOrganizationStatsWithAccess(
      orgId,
      session.user.id
    );

    if (!result.success) {
      return errorApiResultResponse(
        result,
        "Nu s-au putut încărca statisticile organizației"
      );
    }

    return toSuccessApiResponse(result, 200);
  } catch (error) {
    console.error(
      "Organization stats fetch API error:",
      error instanceof Error ? error.message : String(error)
    );
    return internalServerErrorResponse();
  }
};

export const OrganizationController = {
  getUserOrganizations,
  getOrganizationById,
  getOrganizationStats,
};
