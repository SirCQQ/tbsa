import {
  createBuildingSchema,
  updateBuildingInputSchema,
} from "@/lib/validations/building";
import {
  errorServiceResultResponse,
  Handler,
  internalServerErrorResponse,
  toSuccessApiResponse,
  zodErrorToNextResponse,
} from "@/lib/withAuth";
import { buildingService } from "@/services/building.service";
import { ZodError } from "zod";

const createBuilding: Handler<Response> = async (request, session) => {
  try {
    const body = await request.json();

    const validatedData = createBuildingSchema.parse(body);

    const buildingInput = {
      ...validatedData,
      organizationId: session.user.currentOrganizationId,
    };

    const result = await buildingService.createBuilding(buildingInput);
    if (!result.success) {
      return errorServiceResultResponse(result);
    }
    return toSuccessApiResponse(result, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToNextResponse(error);
    }
    return internalServerErrorResponse();
  }
};

const getBuildings: Handler<Response> = async (request, session) => {
  try {
    // 4. Get buildings using service
    const result = await buildingService.getBuildingsByOrganization(
      session.user.currentOrganizationId
    );
    if (!result.success) {
      return errorServiceResultResponse(result);
    }
    return toSuccessApiResponse(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToNextResponse(error);
    }
    return internalServerErrorResponse();
  }
};

const getBuildingById: Handler<Response> = async (
  _request,
  session,
  queryParams: Record<string, Promise<{ buildingId: string }>> | undefined
) => {
  if (!queryParams) {
    return errorServiceResultResponse({
      success: false,
      error: "Apartment ID is required",
      statusCode: 400,
    });
  }
  const { buildingId } = await queryParams.params;

  if (!buildingId) {
    return errorServiceResultResponse({
      success: false,
      error: "Building ID is required",
      statusCode: 400,
    });
  }

  try {
    const result = await buildingService.getBuildingById(
      buildingId,
      session.user.currentOrganizationId
    );
    if (!result.success) {
      return errorServiceResultResponse(result, "Blocul nu a fost găsit");
    }

    if (!result.data) {
      return errorServiceResultResponse({
        success: false,
        error: "Nu s-a găsit niciun bloc cu acest ID",
        statusCode: 404,
      });
    }
    return toSuccessApiResponse({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Get building error:", error);
    if (error instanceof ZodError) {
      return zodErrorToNextResponse(error);
    }
    return internalServerErrorResponse();
  }
};

const updateBuilding: Handler<Response> = async (
  request,
  session,
  queryParams: Record<string, Promise<{ buildingId: string }>> | undefined
) => {
  try {
    if (!queryParams) {
      return errorServiceResultResponse({
        success: false,
        error: "Building ID is required",
        statusCode: 400,
      });
    }
    const { buildingId } = await queryParams.params;
    if (!buildingId) {
      return errorServiceResultResponse({
        success: false,
        error: "Building ID is required",
        statusCode: 400,
      });
    }

    // 5. Parse and validate request body
    const body = await request.json();
    const validationResult = updateBuildingInputSchema.parse(body);
    const updateData = validationResult;

    // 6. Update building using service
    const result = await buildingService.updateBuilding(
      buildingId,
      session.user.currentOrganizationId,
      updateData
    );

    if (!result.success) {
      return errorServiceResultResponse(
        result,
        "Nu s-a putut actualiza blocul"
      );
    }
    if (!result.data) {
      return errorServiceResultResponse({
        success: false,
        error: "Blocul nu a fost găsită",
        statusCode: 404,
      });
    }
    return toSuccessApiResponse({
      success: true,
      data: result.data,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToNextResponse(error);
    }
    return internalServerErrorResponse();
  }
};

const deleteBuilding: Handler<Response> = async (
  _request,
  session,
  queryParams: Record<string, Promise<{ buildingId: string }>> | undefined
) => {
  try {
    if (!queryParams) {
      return errorServiceResultResponse({
        success: false,
        error: "Building ID is required",
        statusCode: 400,
      });
    }
    const { buildingId } = await queryParams.params;
    if (!buildingId) {
      return errorServiceResultResponse({
        success: false,
        error: "Building ID is required",
        statusCode: 400,
      });
    }
    // Delete building using service
    const result = await buildingService.deleteBuilding(
      buildingId,
      session.user.currentOrganizationId
    );
    if (!result.success) {
      return errorServiceResultResponse(result, "Nu s-a putut șterge blocul");
    }
    return toSuccessApiResponse({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Delete building error:", error);
    if (error instanceof ZodError) {
      return zodErrorToNextResponse(error);
    }

    return internalServerErrorResponse();
  }
};
export const BuildingController = {
  createBuilding,
  getBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
};
