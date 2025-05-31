import { NextRequest, NextResponse } from "next/server";
import { InviteCodesService } from "@/services/invite-codes.service";
import { CreateInviteCodeSchema } from "@/lib/validations/invite-codes.validations";
import { ZodError } from "zod";
import { AuthServerService } from "@/services/auth-server.service";
import { createAuthError } from "@/lib/auth-errors";
import { AuthErrorKey } from "@/types/api";

/**
 * GET /api/invite-codes
 * Get all invite codes for the authenticated administrator
 */
export async function GET() {
  try {
    const { user, isAuthenticated } = await AuthServerService.getCurrentUser();

    if (!isAuthenticated || !user) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Check permission using current method signature
    const hasPermission = await AuthServerService.hasPermission(
      "invite_codes",
      "read",
      "all"
    );
    if (!hasPermission) {
      return createAuthError(AuthErrorKey.INSUFFICIENT_PERMISSIONS);
    }

    if (!user.administrator?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
          error: "Administrator profile not configured correctly",
        },
        { status: 400 }
      );
    }

    const result = await InviteCodesService.getInviteCodesByAdministrator(
      user.administrator.id
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch invite codes",
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invite codes retrieved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in GET /api/invite-codes:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}

/**
 * POST /api/invite-codes
 * Create a new invite code
 */
export async function POST(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await AuthServerService.getCurrentUser();

    if (!isAuthenticated || !user) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Check permission using current method signature
    const hasPermission = await AuthServerService.hasPermission(
      "invite_codes",
      "create",
      "all"
    );
    if (!hasPermission) {
      return createAuthError(AuthErrorKey.INSUFFICIENT_PERMISSIONS);
    }

    if (!user.administrator?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
          error: "Administrator profile not configured correctly",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = CreateInviteCodeSchema.parse(body);

    const result = await InviteCodesService.createInviteCode(
      validatedData,
      user.administrator.id
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create invite code",
          error: result.error,
          code: result.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cod de invitație creat cu succes",
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/invite-codes:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          error: "Invalid request data",
          details: error.format(),
        },
        { status: 400 }
      );
    }

    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}
