import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  errorApiResultResponse,
  internalServerErrorResponse,
  toSuccessApiResponse,
  zodErrorToNextResponse,
} from "@/lib/withAuth";

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
      return errorApiResultResponse({
        success: false,
        error: "Token invalid sau expirat",
        statusCode: 400,
      });
    }

    // Check if token has expired
    if (verificationRecord.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });

      return errorApiResultResponse({
        success: false,
        error:
          "Token-ul a expirat. Vă rugăm să solicitați un nou email de confirmare.",
        statusCode: 400,
      });
    }

    // Find and update the user
    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.identifier },
    });

    if (!user) {
      return errorApiResultResponse({
        success: false,
        error: "Utilizatorul nu a fost găsit",
        statusCode: 404,
      });
    }

    if (user.isVerified) {
      // User is already verified, clean up token
      await prisma.verificationToken.delete({
        where: { token },
      });

      return toSuccessApiResponse({
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

    return toSuccessApiResponse({
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
      return zodErrorToNextResponse(error);
    }

    return internalServerErrorResponse();
  }
}

// GET endpoint for verify links (when user clicks email link)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return errorApiResultResponse({
        success: false,
        error: "Token lipsește",
        statusCode: 400,
      });
    }

    // Use the same verification logic as POST
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      return errorApiResultResponse({
        success: false,
        error: "Token invalid sau expirat",
        statusCode: 400,
      });
    }

    if (verificationRecord.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });

      return errorApiResultResponse({
        success: false,
        error: "Token-ul a expirat",
        statusCode: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.identifier },
    });

    if (!user) {
      return errorApiResultResponse({
        success: false,
        error: "Utilizatorul nu a fost găsit",
        statusCode: 404,
      });
    }

    if (user.isVerified) {
      await prisma.verificationToken.delete({
        where: { token },
      });

      return toSuccessApiResponse({
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

    return toSuccessApiResponse({
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
    return errorApiResultResponse({
      success: false,
      error: "A apărut o eroare la verificarea email-ului",
      statusCode: 500,
    });
  }
}
