import { NextRequest, NextResponse } from "next/server";
import { InviteCodesService } from "@/services/invite-codes.service";
import { UseInviteCodeSchema } from "@/lib/validations/invite-codes.validations";
import { ZodError } from "zod";
import { AuthServerService } from "@/services/auth-server.service";
import { createAuthError } from "@/lib/auth-errors";
import { AuthErrorKey } from "@/types/api";

/**
 * POST /api/invite-codes/redeem
 * Redeem an invite code to claim an apartment
 */
export async function POST(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await AuthServerService.getCurrentUser();

    if (!isAuthenticated || !user) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Check permission instead of role
    const hasPermission = await AuthServerService.hasPermission(
      "invite_codes",
      "update",
      "own"
    );
    if (!hasPermission) {
      return createAuthError(AuthErrorKey.INSUFFICIENT_PERMISSIONS);
    }

    if (!user.owner?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
          error: "Owner profile not configured correctly",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = UseInviteCodeSchema.parse({
      ...body,
      userId: user.id, // Add userId from authenticated user
    });

    const result = await InviteCodesService.redeemInviteCode(validatedData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to redeem invite code",
          error: result.error,
          code: result.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Apartamentul a fost adăugat cu succes la contul tău!",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in POST /api/invite-codes/redeem:", error);

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

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
