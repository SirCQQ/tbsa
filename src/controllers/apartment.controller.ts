import {
  createApartmentSchema,
  createBulkApartmentsSchema,
} from "@/lib/validations/apartment";
import {
  errorServiceResultResponse,
  Handler,
  internalServerErrorResponse,
  toSuccessApiResponse,
  zodErrorToNextResponse,
} from "@/lib/withAuth";
import { apartmentService } from "@/services/apartment.service";

import { ZodError } from "zod";

export const createApartment: Handler<Response> = async (
  request,
  session
): Promise<Response> => {
  // 4. Parse and validate request body
  const body = await request.json();

  try {
    const validatedData = createApartmentSchema.parse(body);

    // 5. Create apartment using service
    const result = await apartmentService.createApartment({
      ...validatedData,
      organizationId: session.user.currentOrganizationId,
    });

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

export const createBulkApartments: Handler<Response> = async (
  request,
  session
): Promise<Response> => {
  try {
    const body = await request.json();
    const validatedData = createBulkApartmentsSchema.parse(body);

    const result = await apartmentService.createBulkApartments({
      ...validatedData,
      organizationId: session.user.currentOrganizationId,
    });

    if (!result.success) {
      return errorServiceResultResponse(
        result,
        "A aparut o problemă la crearea apartamentelor"
      );
    }
    const bulkResult = result.data!;

    return toSuccessApiResponse(
      {
        success: true,
        data: {
          total: bulkResult.total,
          successCount: bulkResult.successCount,
          errorCount: bulkResult.errorCount,
          created: bulkResult.created.map((apartment) => ({
            id: apartment.id,
            number: apartment.number,
            floor: apartment.floor,
            buildingId: apartment.buildingId,
            isOccupied: apartment.isOccupied,
            occupantCount: apartment.occupantCount,
            surface: apartment.surface,
            description: apartment.description,
          })),
          errors: bulkResult.errors,
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToNextResponse(error);
    }
    return internalServerErrorResponse();
  }
};

export const getBuildingApartments: Handler<Response> = async (
  request,
  session
): Promise<Response> => {
  try {
    // 4. Parse query parameters
    const url = new URL(request.url);
    const buildingId = url.searchParams.get("buildingId");
    if (!buildingId) {
      return errorServiceResultResponse({
        success: false,
        error: "Building ID is required",
        statusCode: 400,
      });
    }
    // 5. Fetch apartments using service
    const result = await apartmentService.getApartmentsByBuilding(
      buildingId,
      session.user.currentOrganizationId
    );
    if (!result.success) {
      return errorServiceResultResponse(
        result,
        "Nu s-au găsit apartamente pentru acest bloc"
      );
    }
    // 6. Format response
    const formattedApartments = result.data!.map((apartment) => ({
      id: apartment.id,
      number: apartment.number,
      floor: apartment.floor,
      buildingId: apartment.buildingId,
      isOccupied: apartment.isOccupied,
      surface: apartment.surface,
      description: apartment.description,
      building: apartment.building,
      residentCount: apartment._count.apartmentResidents,
      waterMeterCount: apartment._count.waterMeters,
    }));
    return toSuccessApiResponse(
      {
        success: true,
        data: formattedApartments,
      },
      200
    );
  } catch (error) {
    console.error(
      "Apartments fetch API error:",
      error instanceof Error ? error.message : String(error)
    );
    return internalServerErrorResponse();
  }
};

export const getOrgApartmentById: Handler<Response> = async (
  _request,
  session,
  queryParams: Record<string, Promise<{ apartmentId: string }>> | undefined
): Promise<Response> => {
  try {
    if (!queryParams) {
      return errorServiceResultResponse({
        success: false,
        error: "Apartment ID is required",
        statusCode: 400,
      });
    }
    const { apartmentId } = await queryParams.params;

    // Validate apartment ID
    if (!apartmentId) {
      return errorServiceResultResponse({
        success: false,
        error: "Apartment ID is required",
        statusCode: 400,
      });
    }

    // Get apartment by ID
    const result = await apartmentService.getApartmentById(
      apartmentId,
      session.user.currentOrganizationId
    );
    if (!result.success) {
      return errorServiceResultResponse(result, "Apartmentul nu a fost găsit");
    }
    return toSuccessApiResponse({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Get apartment error:", error);
    return internalServerErrorResponse();
  }
};

export const updateApartment: Handler<Response> = async (
  request,
  session,
  queryParams: Record<string, Promise<{ apartmentId: string }>> | undefined
): Promise<Response> => {
  try {
    if (!queryParams) {
      return errorServiceResultResponse({
        success: false,
        error: "Apartment ID is required",
        statusCode: 400,
      });
    }
    const { apartmentId } = await queryParams.params;
    // Parse request body
    const body = await request.json();

    // Update apartment
    const result = await apartmentService.updateApartment(
      apartmentId,
      session.user.currentOrganizationId,
      body
    );

    if (!result.success) {
      return errorServiceResultResponse(
        result,
        "A aparut o problemă la actualizarea apartamentului"
      );
    }

    return toSuccessApiResponse({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Update apartment error:", error);
    return internalServerErrorResponse();
  }
};

export const deleteApartment: Handler<Response> = async (
  _request,
  session,
  queryParams: Record<string, Promise<{ apartmentId: string }>> | undefined
): Promise<Response> => {
  try {
    if (!queryParams) {
      return errorServiceResultResponse({
        success: false,
        error: "Apartment ID is required",
        statusCode: 400,
      });
    }
    const { apartmentId } = await queryParams.params;
    // Validate apartment ID
    if (!apartmentId) {
      return errorServiceResultResponse({
        success: false,
        error: "Apartment ID is required",
        statusCode: 400,
      });
    }
    // Delete apartment
    const result = await apartmentService.deleteApartment(
      apartmentId,
      session.user.currentOrganizationId
    );
    if (!result.success) {
      return errorServiceResultResponse(
        result,
        "A aparut o problemă la ștergerea apartamentului"
      );
    }
    return toSuccessApiResponse(
      {
        success: true,
        data: null,
      },
      204
    );
  } catch (error) {
    console.error("Delete apartment error:", error);
    return internalServerErrorResponse();
  }
};

export const ApartmentController = {
  createApartment,
  createBulkApartments,
  getBuildingApartments,
  getOrgApartmentById,
  updateApartment,
  deleteApartment,
};
