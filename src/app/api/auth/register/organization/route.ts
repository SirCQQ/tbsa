import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { organizationRegistrationSchema } from "@/lib/validations/auth";
import { formatPhoneNumber } from "@/lib/validations/contact";
import { z } from "zod";
import { ActionsEnum, Permission, ResourcesEnum } from "@prisma/client";

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
      // phone,
      // agreeToTerms is validated by schema but not stored
      // subscriptionPlanId will be used later for subscription selection
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

    // Format phone number if provided
    // const formattedPhone = phone ? formatPhoneNumber(phone) : undefined;

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          code: organizationCode,
          description: organizationDescription,
          // subscriptionPlanId will be set later when subscription is selected
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          isActive: true,
          isVerified: true, // Organization admins are auto-verified
        },
      });

      // Create or get ADMINISTRATOR role (system role)
      let adminRole = await tx.role.findUnique({
        where: { code: "ADMINISTRATOR" },
      });

      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            name: "Administrator",
            code: "ADMINISTRATOR",
            description: "Administrator organizație cu acces complet",
            isSystem: true,
          },
        });

        // Create default permissions for ADMINISTRATOR role
        const defaultPermissions: Pick<Permission, "resource" | "action">[] = [
          { resource: ResourcesEnum.USERS, action: ActionsEnum.READ },
          { resource: ResourcesEnum.USERS, action: ActionsEnum.CREATE },
          { resource: ResourcesEnum.USERS, action: ActionsEnum.UPDATE },
          { resource: ResourcesEnum.USERS, action: ActionsEnum.DELETE },
          { resource: ResourcesEnum.ORGANIZATIONS, action: ActionsEnum.READ },
          { resource: ResourcesEnum.ORGANIZATIONS, action: ActionsEnum.UPDATE },
          { resource: ResourcesEnum.BUILDINGS, action: ActionsEnum.READ },
          { resource: ResourcesEnum.BUILDINGS, action: ActionsEnum.CREATE },
          { resource: ResourcesEnum.BUILDINGS, action: ActionsEnum.UPDATE },
          { resource: ResourcesEnum.BUILDINGS, action: ActionsEnum.DELETE },
          { resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.READ },
          { resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.CREATE },
          { resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.UPDATE },
          { resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.DELETE },
          { resource: ResourcesEnum.WATER_READINGS, action: ActionsEnum.READ },
          {
            resource: ResourcesEnum.WATER_READINGS,
            action: ActionsEnum.CREATE,
          },
          {
            resource: ResourcesEnum.WATER_READINGS,
            action: ActionsEnum.UPDATE,
          },
          {
            resource: ResourcesEnum.WATER_READINGS,
            action: ActionsEnum.DELETE,
          },
          { resource: ResourcesEnum.WATER_METERS, action: ActionsEnum.READ },
          { resource: ResourcesEnum.WATER_METERS, action: ActionsEnum.CREATE },
          { resource: ResourcesEnum.WATER_METERS, action: ActionsEnum.UPDATE },
          { resource: ResourcesEnum.WATER_METERS, action: ActionsEnum.DELETE },
          { resource: ResourcesEnum.INVITE_CODES, action: ActionsEnum.READ },
          { resource: ResourcesEnum.INVITE_CODES, action: ActionsEnum.CREATE },
          { resource: ResourcesEnum.INVITE_CODES, action: ActionsEnum.UPDATE },
          { resource: ResourcesEnum.INVITE_CODES, action: ActionsEnum.DELETE },
          { resource: ResourcesEnum.ROLES, action: ActionsEnum.READ },
          { resource: ResourcesEnum.PERMISSIONS, action: ActionsEnum.READ },
          { resource: ResourcesEnum.ADMINISTRATOR, action: ActionsEnum.READ },
          { resource: ResourcesEnum.ADMINISTRATOR, action: ActionsEnum.CREATE },
          { resource: ResourcesEnum.ADMINISTRATOR, action: ActionsEnum.UPDATE },
          { resource: ResourcesEnum.ADMINISTRATOR, action: ActionsEnum.DELETE },
        ];

        // Create permissions for the organization
        const createdPermissions = await Promise.all(
          defaultPermissions.map(async (perm) => {
            return await tx.permission.create({
              data: {
                name: `${perm.resource} ${perm.action}`,
                code: `${perm.resource.toLowerCase()}:${perm.action.toLowerCase()}`,
                resource: perm.resource as any,
                action: perm.action as any,
                description: `Permission to ${perm.action.toLowerCase()} ${perm.resource.toLowerCase()}`,
                organizationId: organization.id,
              },
            });
          })
        );

        // Link permissions to the role
        await Promise.all(
          createdPermissions.map(async (permission) => {
            return await tx.rolePermission.create({
              data: {
                roleId: adminRole!.id,
                permissionId: permission.id,
              },
            });
          })
        );
      }

      // // Link role to organization
      // const organizationRole = await tx.organizationRole.upsert({
      //   where: {
      //     organizationId_roleId: {
      //       organizationId: organization.id,
      //       roleId: adminRole.id,
      //     },
      //   },
      //   create: {
      //     organizationId: organization.id,
      //     roleId: adminRole.id,
      //   },
      //   update: {},
      // });

      // Link user to organization
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
        },
      });

      // Assign role to user
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

    return NextResponse.json({
      success: true,
      message: "Organizația a fost înregistrată cu succes",
      data: result,
    });
  } catch (error) {
    console.error("Organization registration error:", error);

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
