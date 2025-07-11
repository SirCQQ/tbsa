import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermissionServerSide } from "@/lib/auth-helpers";
import { ActionsEnum, ResourcesEnum } from "@prisma/client";
import { WaterMeterService } from "@/services/water-meter.service";
import {
  createWaterMeterSchema,
  bulkCreateWaterMetersSchema,
  waterMeterByApartmentSchema,
} from "@/lib/validations/water-meter";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartmentId = searchParams.get("apartmentId");

    if (!apartmentId) {
      return NextResponse.json(
        { error: "ID-ul apartamentului este obligatoriu" },
        { status: 400 }
      );
    }

    // Validate apartment ID
    const validation = waterMeterByApartmentSchema.safeParse({ apartmentId });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Parametri invalizi",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result =
      await WaterMeterService.getWaterMetersByApartment(apartmentId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      waterMeters: result.data,
    });
  } catch (error) {
    console.error("GET /api/water-meters error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la încărcarea contoarelor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu sunteți autentificat" },
        { status: 401 }
      );
    }

    // Check permissions
    const hasCreatePermission = await hasPermissionServerSide(
      session.user.permissions || [],
      ResourcesEnum.APARTMENTS,
      ActionsEnum.UPDATE
    );

    if (!hasCreatePermission) {
      return NextResponse.json(
        { error: "Nu aveți permisiunea de a gestiona contoare de apă" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log(
      "POST /api/water-meters - Request body:",
      JSON.stringify(body, null, 2)
    );

    // Check if this is a bulk create request
    if (body.waterMeters && Array.isArray(body.waterMeters)) {
      // Bulk create validation
      const validation = bulkCreateWaterMetersSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Datele introduse sunt invalide",
            details: validation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const result = await WaterMeterService.bulkCreateWaterMeters(
        validation.data,
        session.user.id
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `${result.data?.length} contoare au fost create cu succes`,
        waterMeters: result.data,
      });
    } else {
      // Single create validation
      const validation = createWaterMeterSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Datele introduse sunt invalide",
            details: validation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const result = await WaterMeterService.createWaterMeter(
        validation.data,
        session.user.id
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Contorul a fost creat cu succes",
        waterMeter: result.data,
      });
    }
  } catch (error) {
    console.error("POST /api/water-meters error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la crearea contorului" },
      { status: 500 }
    );
  }
}
