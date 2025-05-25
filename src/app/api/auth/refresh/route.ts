import { createAuthError, auditAuthEvent } from "@/lib/auth-errors";
import { SessionService } from "@/services/session.service";
import { AuthErrorKey } from "@/types/api";
import { SessionFingerprint } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Extract client IP address from request headers
 */
function getClientIP(request: NextRequest): string | undefined {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-client-ip") ||
    undefined
  );
}

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || "";
    const acceptLanguage = req.headers.get("accept-language") || "";
    const acceptEncoding = req.headers.get("accept-encoding") || "";

    // Get refresh token from cookie
    const refreshToken = req.cookies.get("refresh-token")?.value;

    if (!refreshToken) {
      auditAuthEvent(
        "token_invalid",
        undefined,
        undefined,
        clientIP,
        userAgent,
        { reason: "missing_refresh_token" }
      );
      return createAuthError(
        AuthErrorKey.MISSING_TOKEN,
        "Refresh token required"
      );
    }

    // Create current session fingerprint
    const currentFingerprint: SessionFingerprint = {
      userAgent,
      ipAddress: clientIP || "",
      acceptLanguage,
      acceptEncoding,
    };

    // Refresh the access token
    const result = await SessionService.refreshAccessToken(
      refreshToken,
      currentFingerprint
    );

    if (!result.success) {
      auditAuthEvent(
        "token_invalid",
        undefined,
        undefined,
        clientIP,
        userAgent,
        {
          reason: result.code || "unknown",
          error: result.error,
        }
      );

      return NextResponse.json(
        {
          error: result.error,
          message: result.message,
          code: result.code,
        },
        { status: 401 }
      );
    }

    if (!result.data) {
      return createAuthError(AuthErrorKey.INTERNAL_ERROR);
    }

    // Audit successful token refresh (using login_success as closest match)
    auditAuthEvent(
      "login_success",
      undefined, // We don't have userId easily accessible here
      undefined,
      clientIP,
      userAgent,
      {
        event_type: "token_refresh",
        hasNewRefreshToken: !!result.data.refreshToken,
      }
    );

    // Create response
    const response = NextResponse.json(
      {
        message: "Token refreshed successfully",
        accessToken: result.data.accessToken,
      },
      { status: 200 }
    );

    // Set new access token cookie
    response.cookies.set("auth-token", result.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
    });

    // Set new refresh token if provided (token rotation)
    if (result.data.refreshToken) {
      response.cookies.set("refresh-token", result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error("Token refresh API error:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}
