import { NextRequest, NextResponse } from "next/server";
import { ApartmentService } from "@/services/apartment.service";
import { ApartmentSchema } from "@/schemas/apartment";
import { TenantService } from "@/services/tenant.service";
import { ZodError } from "zod";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get tenant context from headers
    const tenantContext = TenantService.getTenantContext(request);

    // Get apartment using service
    const result = await ApartmentService.getApartmentById(
      id,
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
    console.error("Error in GET /api/apartments/[id]:", error);

    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get tenant context from headers
    const tenantContext = TenantService.getTenantContext(request);

    // Only users with apartment update permissions can update apartments
    if (
      !tenantContext ||
      !TenantService.hasPermission(tenantContext, "apartments:update:all")
    ) {
      return NextResponse.json(
        { error: "Nu aveți permisiunea să modificați apartamente" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ApartmentSchema.partial().parse(body);

    // Update apartment using service
    const result = await ApartmentService.updateApartment(
      id,
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

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in PUT /api/apartments/[id]:", error);

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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get tenant context from headers
    const tenantContext = TenantService.getTenantContext(request);

    // Only users with apartment delete permissions can delete apartments
    if (
      !tenantContext ||
      !TenantService.hasPermission(tenantContext, "apartments:delete:all")
    ) {
      return NextResponse.json(
        { error: "Nu aveți permisiunea să ștergeți apartamente" },
        { status: 403 }
      );
    }

    // Delete apartment using service
    const result = await ApartmentService.deleteApartment(
      id,
      tenantContext || undefined
    );

    if (!result.success) {
      const statusCode =
        result.code === "NOT_FOUND"
          ? 404
          : result.code === "CONSTRAINT_VIOLATION"
          ? 409
          : 500;

      return NextResponse.json(
        { error: result.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in DELETE /api/apartments/[id]:", error);

    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
