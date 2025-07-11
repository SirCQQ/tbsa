import { NextRequest, NextResponse } from "next/server";
import { WaterMeterService } from "@/services/water-meter.service";
import {
  updateWaterMeterSchema,
  waterMeterIdSchema,
} from "@/lib/validations/water-meter";

type RouteParams = {
  params: Promise<{ waterMeterId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { waterMeterId } = await params;

    // Validate water meter ID
    const validation = waterMeterIdSchema.safeParse({ id: waterMeterId });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "ID-ul contorului este invalid",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await WaterMeterService.getWaterMeterById(waterMeterId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Contorul nu a fost găsit" ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      waterMeter: result.data,
    });
  } catch (error) {
    console.error("GET /api/water-meters/[waterMeterId] error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la încărcarea contorului" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { waterMeterId } = await params;
    const body = await request.json();

    // Validate water meter ID
    const idValidation = waterMeterIdSchema.safeParse({ id: waterMeterId });
    if (!idValidation.success) {
      return NextResponse.json(
        {
          error: "ID-ul contorului este invalid",
          details: idValidation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Validate update data
    const validation = updateWaterMeterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datele introduse sunt invalide",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await WaterMeterService.updateWaterMeter(
      waterMeterId,
      validation.data
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Contorul nu a fost găsit" ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contorul a fost actualizat cu succes",
      waterMeter: result.data,
    });
  } catch (error) {
    console.error("PUT /api/water-meters/[waterMeterId] error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la actualizarea contorului" },
      { status: 500 }
    );
  }
}

// Also support PATCH for consistency with axios client
export const PATCH = PUT;

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { waterMeterId } = await params;

    // Validate water meter ID
    const validation = waterMeterIdSchema.safeParse({ id: waterMeterId });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "ID-ul contorului este invalid",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await WaterMeterService.deleteWaterMeter(waterMeterId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Contorul nu a fost găsit" ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contorul a fost șters cu succes",
    });
  } catch (error) {
    console.error("DELETE /api/water-meters/[waterMeterId] error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la ștergerea contorului" },
      { status: 500 }
    );
  }
}
