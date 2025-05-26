import { createAuthError, getJWTErrorType } from "@/lib/auth-errors";
import { prisma } from "@/lib/prisma";
import { AuthErrorKey } from "@/types/api";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return createAuthError(AuthErrorKey.MISSING_TOKEN);
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        administrator: true,
        owner: {
          include: {
            apartments: {
              include: {
                building: {
                  select: {
                    id: true,
                    name: true,
                    readingDeadline: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return createAuthError(AuthErrorKey.USER_NOT_FOUND);
    }

    // Prepare user data for response (exclude password)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      administrator: user.administrator,
      owner: user.owner,
    };

    // Return user data directly (not wrapped in user object)
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Session verification error:", error);
    const errorType = getJWTErrorType(error);
    return createAuthError(errorType);
  }
}
