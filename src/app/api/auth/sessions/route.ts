import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/services/session.service";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

// Get user's active sessions
export async function GET(request: NextRequest) {
  try {
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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get user's active sessions
    const result = await SessionService.getUserSessions(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Invalidate all user sessions (logout from all devices)
export async function DELETE(request: NextRequest) {
  try {
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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Invalidate all user sessions
    const result = await SessionService.invalidateAllUserSessions(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Create response and clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: "All sessions invalidated successfully",
    });

    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Delete all sessions error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
