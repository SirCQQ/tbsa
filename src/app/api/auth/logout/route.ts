import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { createAuthError } from "@/lib/auth-errors";
import { AuthErrorKey } from "@/types/api";

export async function POST() {
  try {
    // Use service for logout logic
    const result = await AuthService.logout();

    if (!result.success) {
      return createAuthError(AuthErrorKey.INTERNAL_ERROR);
    }

    // Create response with success message
    const response = NextResponse.json(result.data, { status: 200 });

    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Immediately expire the cookie
    });

    // Clear the refresh token cookie
    response.cookies.set("refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Immediately expire the cookie
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}

// Allow GET requests for logout as well (for convenience)
export async function GET() {
  return POST();
}
