import { NextRequest, NextResponse } from "next/server";
import { ApartmentService } from "@/services/apartment.service";
import { getTenantContext } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    // Get tenant context from headers
    const tenantContext = getTenantContext(request);

    // Get apartment statistics using service
    const result = await ApartmentService.getApartmentStats(
      tenantContext || undefined
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/apartments/stats:", error);

    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
