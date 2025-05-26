import { createAuthError } from "@/lib/auth-errors";
import { AuthService } from "@/services/auth.service";
import { AuthErrorKey } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Use service to get current user
    const result = await AuthService.getCurrentUser(token);

    if (!result.success) {
      return createAuthError(
        result.code === "AUTH_006"
          ? AuthErrorKey.USER_NOT_FOUND
          : AuthErrorKey.INVALID_TOKEN
      );
    }

    // Return user data directly (not wrapped in user object)
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("Session verification error:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}
