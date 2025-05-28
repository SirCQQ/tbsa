import { createAuthError, auditAuthEvent } from "@/lib/auth-errors";
import { AuthService } from "@/services/auth.service";
import { AuthErrorKey } from "@/types/api";
import { LoginRequest, SessionFingerprint } from "@/types/auth";
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
    const body: LoginRequest = await req.json();
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || "";
    const acceptLanguage = req.headers.get("accept-language") || "";
    const acceptEncoding = req.headers.get("accept-encoding") || "";

    // Create session fingerprint for enhanced security
    const fingerprint: SessionFingerprint = {
      userAgent,
      ipAddress: clientIP || "",
      acceptLanguage,
      acceptEncoding,
    };

    const result = await AuthService.login(body, fingerprint);

    if (!result.success) {
      // Audit failed login attempt
      auditAuthEvent(
        "login_failed",
        undefined,
        body.email,
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
          details: result.details,
        },
        { status: 401 }
      );
    }

    if (!result.data) {
      return createAuthError(AuthErrorKey.INTERNAL_ERROR);
    }

    // Audit successful login
    auditAuthEvent(
      "login_success",
      result.data.user.id,
      result.data.user.email,
      clientIP,
      userAgent,
      {
        hasRefreshToken: !!result.data.refreshToken,
      }
    );

    // Log successful login
    console.log(
      `User ${result.data.user.email} logged in successfully from ${clientIP} using ${userAgent}`,
      {
        hasRefreshToken: !!result.data.refreshToken,
      }
    );

    // Create response with user data
    const response = NextResponse.json(
      {
        message: result.message,
        user: result.data.user,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie with JWT (shorter expiration for enhanced security)
    response.cookies.set("auth-token", result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes for enhanced security
    });

    // Set refresh token cookie if available
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
    console.error("Login API error:", error);
    return createAuthError(AuthErrorKey.INTERNAL_ERROR);
  }
}
