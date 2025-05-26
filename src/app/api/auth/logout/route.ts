import { NextRequest, NextResponse } from "next/server";

import { SessionService } from "@/services/session.service";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value;

    if (token) {
      try {
        // Verify token to get session ID
        const { payload } = await jwtVerify(token, secret);
        const sessionId = payload.sessionId as string;

        if (sessionId) {
          // Invalidate the specific session
          await SessionService.invalidateSession(sessionId);
        }
      } catch (error) {
        // Token might be invalid, but we still want to clear the cookie
        console.warn("Error invalidating session during logout:", error);
      }
    }

    // Create response and clear the auth cookie
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    // Even if there's an error, clear the cookie
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
}

// Allow GET requests for logout as well (for convenience)
export async function GET(request: NextRequest) {
  return POST(request);
}
