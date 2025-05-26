import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth-server.service";
import { createAuthError } from "@/lib/auth-errors";
import { AuthErrorKey } from "@/types/api";
import { BuildingsService } from "@/services/buildings.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/buildings/[id] - Get building details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, isAuthenticated } = await getCurrentUser();

    if (!isAuthenticated || !user) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Only administrators can view building details
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

    const { id } = await params;

    // Use service to get building
    const result = await BuildingsService.getBuildingById(
      id,
      user.administrator.id
    );

    if (!result.success) {
      const statusCode =
        result.code === "VALIDATION_FAILED"
          ? 400
          : result.code === "BUILDING_NOT_FOUND"
          ? 404
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

    return NextResponse.json({
      success: true,
      message: "Building retrieved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in GET /api/buildings/[id]:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}

// PUT /api/buildings/[id] - Update building
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, isAuthenticated } = await getCurrentUser();

    if (!isAuthenticated || !user) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Only administrators can update buildings
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

    const { id } = await params;
    const body = await request.json();

    // Use service to update building
    const result = await BuildingsService.updateBuilding(
      id,
      body,
      user.administrator.id
    );

    if (!result.success) {
      const statusCode =
        result.code === "VALIDATION_FAILED"
          ? 400
          : result.code === "BUILDING_NOT_FOUND"
          ? 404
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

    return NextResponse.json({
      success: true,
      message: "Clădirea a fost actualizată cu succes",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in PUT /api/buildings/[id]:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}

// DELETE /api/buildings/[id] - Delete building
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, isAuthenticated } = await getCurrentUser();

    if (!isAuthenticated || !user) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Only administrators can delete buildings
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

    const { id } = await params;

    // Use service to delete building
    const result = await BuildingsService.deleteBuilding(
      id,
      user.administrator.id
    );

    if (!result.success) {
      const statusCode =
        result.code === "VALIDATION_FAILED"
          ? 400
          : result.code === "BUILDING_NOT_FOUND"
          ? 404
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

    return NextResponse.json({
      success: true,
      message: "Clădirea a fost ștearsă cu succes",
    });
  } catch (error) {
    console.error("Error in DELETE /api/buildings/[id]:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}
