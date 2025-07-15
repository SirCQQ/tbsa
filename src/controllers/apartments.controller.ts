import { createApartmentSchema } from "@/lib/validations/apartment";
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

export const ApartmentController = {
  createApartment,
};
