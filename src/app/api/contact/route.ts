import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations/contact";
import { contactService } from "@/services/contact.service";
import { z } from "zod";

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
    console.error("Contact form error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Datele introduse nu sunt valide",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message:
          "A apărut o eroare la trimiterea mesajului. Vă rugăm să încercați din nou.",
      },
      { status: 500 }
    );
  }
}
