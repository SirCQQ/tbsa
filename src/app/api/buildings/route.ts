import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth-server.service";
import { createAuthError } from "@/lib/auth-errors";
import { AuthErrorKey } from "@/types/api";
import { BuildingsService } from "@/services/buildings.service";
import { requirePermission } from "@/lib/auth";

// GET /api/buildings - List all buildings with pagination
export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser();

    if (!isAuthenticated || !user) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Check permission using JWT
    try {
      await requirePermission({
        resource: "buildings",
        action: "read",
        scope: "own",
      });
    } catch (_error) {
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

    // Check permission using JWT
    try {
      await requirePermission({
        resource: "buildings",
        action: "create",
        scope: "own",
      });
    } catch (_error) {
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

    // Use service to create building with apartments
    const result = await BuildingsService.createBuildingWithApartments(
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
