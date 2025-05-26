import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/services/session.service";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

// Invalidate a specific session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token to get user ID
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;
    const currentSessionId = payload.sessionId as string;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // First, verify that the session belongs to the current user
    const userSessions = await SessionService.getUserSessions(userId);

    if (!userSessions.success) {
      return NextResponse.json(
        { success: false, error: "Failed to verify session ownership" },
        { status: 500 }
      );
    }

    const sessionExists = userSessions.data?.some(
      (session) => session.id === sessionId
    );

    if (!sessionExists) {
      return NextResponse.json(
        { success: false, error: "Session not found or access denied" },
        { status: 404 }
      );
    }

    // Invalidate the specific session
    const result = await SessionService.invalidateSession(sessionId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // If the user is invalidating their current session, clear the cookie
    const response = NextResponse.json({
      success: true,
      message: "Session invalidated successfully",
    });

    if (currentSessionId === sessionId) {
      response.cookies.set("auth-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
