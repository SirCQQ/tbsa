import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { ApartmentService } from "@/services/apartment.service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: buildingId } = await params;

    // Get tenant context from headers
    const tenantContext = TenantService.getTenantContext(request);

    // Get apartments for building using service
    const result = await ApartmentService.getApartmentsByBuilding(
      buildingId,
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
    console.error("Error in GET /api/buildings/[id]/apartments:", error);

    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
