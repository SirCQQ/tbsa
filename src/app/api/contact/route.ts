import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations/contact";
import { contactService } from "@/services/contact.service";
import { z } from "zod";
import {
  errorApiResultResponse,
  internalServerErrorResponse,
  zodErrorToNextResponse,
} from "@/lib/withAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = contactFormSchema.parse(body);

    // Gather metadata for logging and tracking
    const metadata = {
      userAgent: request.headers.get("user-agent") || undefined,
      timestamp: new Date().toISOString(),
    };

    // Process the contact form submission using the service
    const result = await contactService.submitContactForm(
      validatedData,
      metadata
    );

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodErrorToNextResponse(error);
    }
    return internalServerErrorResponse();
  }
}
