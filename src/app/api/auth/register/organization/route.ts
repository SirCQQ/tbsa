import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { organizationRegistrationSchema } from "@/lib/validations/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";
import { errorApiResultResponse, zodErrorToNextResponse } from "@/lib/withAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request data
    const validatedData = organizationRegistrationSchema.parse(body);

    const { firstName, lastName, email, password } = validatedData;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilizator cu acest email există deja" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and assign ADMINISTRATOR role
    const result = await prisma.$transaction(async (tx) => {
      // Create user (not verified initially - will be verified via email)
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          isActive: true,
          isVerified: false, // User needs to verify email
        },
      });

      // Get the existing global ADMINISTRATOR role (created by seed data)
      const adminRole = await tx.role.findUnique({
        where: { code: "ADMINISTRATOR" },
      });

      if (!adminRole) {
        throw new Error(
          "ADMINISTRATOR role not found. Please run database seed first."
        );
      }

      // Assign ADMINISTRATOR role to user
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
        },
        role: {
          id: adminRole.id,
          name: adminRole.name,
          code: adminRole.code,
        },
      };
    });

    // Send welcome/confirmation email
    try {
      // Generate verification token (simple timestamp-based for now)
      const verificationToken = Buffer.from(
        `${result.user.id}:${Date.now()}:${Math.random()}`
      ).toString("base64url");

      // Save verification token to database
      await prisma.verificationToken.create({
        data: {
          identifier: result.user.email,
          token: verificationToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      const emailResult = await sendWelcomeEmail(
        result.user.email,
        result.user.firstName,
        verificationToken
      );

      console.log(
        `Welcome email sent to ${result.user.email}:`,
        emailResult.success
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the registration if email fails - user can still verify later
    }

    return NextResponse.json({
      success: true,
      message:
        "Contul a fost creat cu succes și vi s-a atribuit rolul de Administrator. Verificați email-ul pentru confirmarea contului.",
      data: result,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return zodErrorToNextResponse(error);
    }
    return errorApiResultResponse({
      success: false,
      error: "Internal server error",
      data: null,
      statusCode: 500,
    });
  }
}
