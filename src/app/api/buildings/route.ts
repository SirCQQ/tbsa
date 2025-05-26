import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { createAuthError } from "@/lib/auth-errors";
import { AuthErrorKey } from "@/types/api";
import { BuildingsService } from "@/services/buildings.service";

// GET /api/buildings - List all buildings with pagination
export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser();

    if (!isAuthenticated || !user) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Only administrators can list buildings
    if (user.role !== "ADMINISTRATOR") {
      return createAuthError(AuthErrorKey.INSUFFICIENT_PERMISSIONS);
    }

    if (!user.administrator?.id) {
      return NextResponse.json(
        {
          error: "Profilul de administrator nu este configurat corect",
          code: "ADMIN_PROFILE_INVALID",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Use service to get buildings
    const result = await BuildingsService.getBuildings(
      user.administrator.id,
      queryParams
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          code: result.code,
          details: result.details,
        },
        { status: result.code === "VALIDATION_FAILED" ? 400 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Buildings retrieved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in GET /api/buildings:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}

// POST /api/buildings - Create a new building
export async function POST(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser();

    if (!isAuthenticated || !user) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Only administrators can create buildings
    if (user.role !== "ADMINISTRATOR") {
      return createAuthError(AuthErrorKey.INSUFFICIENT_PERMISSIONS);
    }

    if (!user.administrator?.id) {
      return NextResponse.json(
        {
          error: "Profilul de administrator nu este configurat corect",
          code: "ADMIN_PROFILE_INVALID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Use service to create building
    const result = await BuildingsService.createBuilding(
      body,
      user.administrator.id
    );

    if (!result.success) {
      const statusCode =
        result.code === "VALIDATION_FAILED"
          ? 400
          : result.code === "BUILDING_ALREADY_EXISTS"
          ? 409
          : 500;

      return NextResponse.json(
        {
          error: result.error,
          code: result.code,
          details: result.details,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Clădirea a fost creată cu succes",
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/buildings:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}
