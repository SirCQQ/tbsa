import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import type { RegisterRequest } from "@/types/auth";

export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json();

    const result = await AuthService.register(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          message: result.message,
          details: result.details,
        },
        {
          status:
            result.error === "User with this email already exists" ? 409 : 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: result.message,
        user: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
