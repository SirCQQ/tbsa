import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for verification request
const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token este obligatoriu"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Find the verification token
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Token invalid sau expirat",
        },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (verificationRecord.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "Token-ul a expirat. Vă rugăm să solicitați un nou email de confirmare.",
        },
        { status: 400 }
      );
    }

    // Find and update the user
    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.identifier },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilizatorul nu a fost găsit",
        },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      // User is already verified, clean up token
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json({
        success: true,
        message: "Contul este deja verificat",
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified,
          },
        },
      });
    }

    // Verify the user and clean up token in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user verification status
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          emailVerified: new Date(), // NextAuth.js field
        },
      });

      // Remove the used verification token
      await tx.verificationToken.delete({
        where: { token },
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      message: "Email verificat cu succes! Contul dvs. este acum activ.",
      data: {
        user: {
          id: result.id,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          isVerified: result.isVerified,
        },
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Token invalid",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "A apărut o eroare la verificarea email-ului. Vă rugăm să încercați din nou.",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for verify links (when user clicks email link)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Token lipsește",
        },
        { status: 400 }
      );
    }

    // Use the same verification logic as POST
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Token invalid sau expirat",
        },
        { status: 400 }
      );
    }

    if (verificationRecord.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        {
          success: false,
          error: "Token-ul a expirat",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.identifier },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilizatorul nu a fost găsit",
        },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json({
        success: true,
        message: "Contul este deja verificat",
        data: {
          user: {
            email: user.email,
            firstName: user.firstName,
            isVerified: true,
          },
        },
      });
    }

    // Verify user
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          emailVerified: new Date(),
        },
      });

      await tx.verificationToken.delete({
        where: { token },
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      message: "Email verificat cu succes!",
      data: {
        user: {
          id: result.id,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          isVerified: result.isVerified,
        },
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "A apărut o eroare la verificarea email-ului",
      },
      { status: 500 }
    );
  }
}
