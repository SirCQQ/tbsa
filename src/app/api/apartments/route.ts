import { NextRequest, NextResponse } from "next/server";
import { ApartmentService } from "@/services/apartment.service";
import { ApartmentSchema, ApartmentQuerySchema } from "@/schemas/apartment";
import { getTenantContext } from "@/lib/tenant";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    // Get tenant context from headers
    const tenantContext = getTenantContext(request);

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = ApartmentQuerySchema.parse(queryParams);

    // Get apartments using service
    const result = await ApartmentService.getApartments(
      validatedQuery,
      tenantContext || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.code === "NOT_FOUND" ? 404 : 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/apartments:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Parametrii de căutare sunt invalizi",
          details: error.format(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get tenant context from headers
    const tenantContext = getTenantContext(request);

    // Only administrators can create apartments
    if (tenantContext?.role !== "ADMINISTRATOR") {
      return NextResponse.json(
        { error: "Nu aveți permisiunea să creați apartamente" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ApartmentSchema.parse(body);

    // Create apartment using service
    const result = await ApartmentService.createApartment(
      validatedData,
      tenantContext || undefined
    );

    if (!result.success) {
      const statusCode =
        result.code === "NOT_FOUND"
          ? 404
          : result.code === "DUPLICATE_ENTRY"
          ? 409
          : 500;

      return NextResponse.json(
        { error: result.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/apartments:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Datele apartamentului sunt invalide",
          details: error.format(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
