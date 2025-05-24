import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import type { LoginRequest } from "@/types/auth";

export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json();

    const result = await AuthService.login(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          message: result.message,
          details: result.details,
        },
        { status: 401 }
      );
    }

    if (!result.data) {
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    // Create response with user data
    const response = NextResponse.json(
      {
        message: result.message,
        user: result.data.user,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie with JWT
    response.cookies.set("auth-token", result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
