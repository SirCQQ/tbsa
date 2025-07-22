import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { userRegistrationSchema } from "@/lib/validations/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";
import {
  internalServerErrorResponse,
  zodErrorToNextResponse,
} from "@/lib/withAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request data
    const validatedData = userRegistrationSchema.parse(body);

    const { firstName, lastName, email, password, inviteCode } = validatedData;

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

    // Validate invite code
    const inviteCodeRecord = await prisma.inviteCode.findUnique({
      where: { code: inviteCode },
      include: {
        createdBy: {
          include: {
            organizations: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!inviteCodeRecord) {
      return NextResponse.json(
        { error: "Codul de invitație nu este valid" },
        { status: 400 }
      );
    }

    // Check if invite code is still active
    if (inviteCodeRecord.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Codul de invitație nu mai este activ" },
        { status: 400 }
      );
    }

    // Check if invite code has expired
    if (inviteCodeRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Codul de invitație a expirat" },
        { status: 400 }
      );
    }

    // Check if invite code is for this email
    if (inviteCodeRecord.email !== email) {
      return NextResponse.json(
        { error: "Codul de invitație nu este destinat pentru acest email" },
        { status: 400 }
      );
    }

    // Get the organization from the invite code creator
    const creatorOrganization = inviteCodeRecord.createdBy.organizations[0];
    if (!creatorOrganization) {
      return NextResponse.json(
        { error: "Nu s-a putut determina organizația pentru înregistrare" },
        { status: 400 }
      );
    }

    const organization = creatorOrganization.organization;

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and associate with organization in a transaction
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

      // Get the default user role (e.g., TENANT or RESIDENT)
      const defaultRole = await tx.role.findFirst({
        where: {
          code: { in: ["TENANT", "RESIDENT", "USER"] }, // Fallback to available roles
        },
      });

      if (!defaultRole) {
        throw new Error(
          "No default role found for user registration. Please ensure roles are seeded."
        );
      }

      // Link user to organization
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
        },
      });

      // Assign default role to user
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id,
        },
      });

      // Mark invite code as used
      await tx.inviteCode.update({
        where: { id: inviteCodeRecord.id },
        data: {
          status: "USED",
          usedAt: new Date(),
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
        organization: {
          id: organization.id,
          name: organization.name,
          code: organization.code,
        },
        role: {
          id: defaultRole.id,
          name: defaultRole.name,
          code: defaultRole.code,
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
        "Înregistrarea a fost completată cu succes. Verificați email-ul pentru confirmarea contului.",
      data: result,
    });
  } catch (error) {
    console.error("User registration error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return zodErrorToNextResponse(error);
    }

    return internalServerErrorResponse();
  }
}
