import { NextRequest, NextResponse } from "next/server";
import { InviteCodesService } from "@/services/invite-codes.service";

/**
 * POST /api/invite-codes/[id]/cancel
 * Cancel an invite code
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const administratorId = request.headers.get("x-administrator-id");

    if (!administratorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
          error: "Administrator ID not found",
        },
        { status: 401 }
      );
    }

    const { id: codeId } = await params;

    if (!codeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request",
          error: "Code ID is required",
        },
        { status: 400 }
      );
    }

    const result = await InviteCodesService.cancelInviteCode(
      codeId,
      administratorId
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to cancel invite code",
          error: result.error,
          code: result.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cod de invitație anulat cu succes",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in POST /api/invite-codes/[id]/cancel:", error);
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
