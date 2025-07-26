import { NextRequest } from "next/server";
import { OrganizationService } from "@/services/organization.service";
import {
  toSuccessApiResponse,
  errorApiResultResponse,
  internalServerErrorResponse,
} from "@/lib/withAuth";

type Props = {
  params: Promise<{ code: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { code } = await params;

    // Validate code format (basic validation)
    if (!code || code.length < 3) {
      return errorApiResultResponse({
        success: false,
        error: "Codul trebuie să aibă cel puțin 3 caractere",
        statusCode: 400,
      });
    }

    // Check if code is available
    const result = await OrganizationService.isCodeAvailable(code);

    if (!result.success) {
      return errorApiResultResponse(result);
    }

    return toSuccessApiResponse({
      success: true,
      data: {
        available: result.data,
        code: code,
      },
      message: result.data
        ? "Codul este disponibil"
        : "Codul este deja folosit",
    });
  } catch (error) {
    console.error("Error checking organization code:", error);
    return internalServerErrorResponse();
  }
}
