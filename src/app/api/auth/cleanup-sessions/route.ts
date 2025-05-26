import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/services/session.service";

// Clean up expired sessions - useful for cron jobs
export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key authentication for security
    const apiKey = request.headers.get("x-api-key");
    const expectedApiKey = process.env.CLEANUP_API_KEY;

    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Clean up expired sessions
    const result = await SessionService.cleanupExpiredSessions();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Session cleanup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow GET requests as well for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
