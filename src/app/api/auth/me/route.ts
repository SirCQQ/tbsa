import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Session verification error:", error);

    // If JWT is invalid, clear the cookie
    const response = NextResponse.json(
      { error: "Invalid session" },
      { status: 401 }
    );

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  }
}
