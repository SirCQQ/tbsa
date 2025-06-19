import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { organizationRegistrationSchema } from "@/lib/validations/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request data
    const validatedData = organizationRegistrationSchema.parse(body);

    const {
      firstName,
      lastName,
      email,
      password,
      organizationName,
      organizationCode,
      organizationDescription,
    } = validatedData;

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

    // Check if organization code already exists
    const existingOrganization = await prisma.organization.findUnique({
      where: { code: organizationCode },
    });

    if (existingOrganization) {
      return NextResponse.json(
        { error: "Codul organizației este deja folosit" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Get available subscription plans for random assignment
    // TODO: Update this to allow user selection of subscription plan
    const availablePlans = await prisma.subscriptionPlan.findMany({
      where: { deletedAt: null },
    });

    if (availablePlans.length === 0) {
      return NextResponse.json(
        { error: "Nu sunt disponibile planuri de abonament" },
        { status: 500 }
      );
    }

    // Select a random subscription plan (for now)
    const randomPlan =
      availablePlans[Math.floor(Math.random() * availablePlans.length)];

    // Create organization, user, and assign role in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization with random subscription
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          code: organizationCode,
          description: organizationDescription,
          subscriptionPlanId: randomPlan.id,
        },
      });

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

      // Link user to organization
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
        },
      });

      // Assign ADMINISTRATOR role to user
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      return {
        organization: {
          id: organization.id,
          name: organization.name,
          code: organization.code,
          description: organization.description,
          subscriptionPlan: {
            id: randomPlan.id,
            name: randomPlan.name,
            price: randomPlan.price,
          },
        },
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
        "Înregistrarea a fost completată cu succes. Verificați email-ul pentru confirmarea contului.",
      data: result,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Datele introduse nu sunt valide",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "Email-ul sau codul organizației sunt deja folosite",
          },
          { status: 400 }
        );
      }

      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "Eroare de integritate a datelor",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "A apărut o eroare la înregistrare. Vă rugăm să încercați din nou.",
      },
      { status: 500 }
    );
  }
}
