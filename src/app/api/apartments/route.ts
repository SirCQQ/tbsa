import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apartmentService } from "@/services/apartment.service";
import {
  createApartmentSchema,
  createBulkApartmentsSchema,
} from "@/lib/validations/apartment";
import { hasPermissionServerSide } from "@/lib/auth-helpers";
import { ResourcesEnum, ActionsEnum } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check permissions - user must have apartment creation permissions
    const hasCreatePermission = await hasPermissionServerSide(
      session.user.permissions || [],
      ResourcesEnum.APARTMENTS,
      ActionsEnum.CREATE
    );

    if (!hasCreatePermission) {
      return NextResponse.json(
        {
          error: "Insufficient permissions.",
        },
        { status: 403 }
      );
    }

    // 3. Validate organization access
    if (!session.user.currentOrganizationId) {
      return NextResponse.json(
        { error: "No organization context found" },
        { status: 400 }
      );
    }

    // 4. Parse and validate request body
    const body = await request.json();
    const validatedData = createApartmentSchema.parse(body);

    // 5. Create apartment using service
    const result = await apartmentService.createApartment({
      ...validatedData,
      organizationId: session.user.currentOrganizationId,
    });

    if (!result.success) {
      // Handle specific validation errors
      if (result.error?.includes("already exists")) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: [
              {
                field: "number",
                message: result.error,
              },
            ],
          },
          { status: 400 }
        );
      }

      if (result.error?.includes("Floor cannot exceed")) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: [
              {
                field: "floor",
                message: result.error,
              },
            ],
          },
          { status: 400 }
        );
      }

      if (result.error?.includes("not found")) {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }

      return NextResponse.json(
        { error: result.error || "Failed to create apartment" },
        { status: 500 }
      );
    }

    // 6. Return success response
    const apartment = result.data!;
    return NextResponse.json(
      {
        success: true,
        message: "Apartment created successfully",
        data: {
          id: apartment.id,
          number: apartment.number,
          floor: apartment.floor,
          buildingId: apartment.buildingId,
          isOccupied: apartment.isOccupied,
          surface: apartment.surface,
          description: apartment.description,
          createdAt: apartment.createdAt.toISOString(),
          updatedAt: apartment.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Apartment creation API error:",
      error instanceof Error ? error.message : String(error)
    );

    // Handle Zod validation errors
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as {
        issues: Array<{ path: (string | number)[]; message: string }>;
      };
      return NextResponse.json(
        {
          error: "Validation failed",
          details: zodError.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check permissions - user must have apartment creation permissions
    const hasCreatePermission = await hasPermissionServerSide(
      session.user.permissions || [],
      ResourcesEnum.APARTMENTS,
      ActionsEnum.CREATE
    );

    if (!hasCreatePermission) {
      return NextResponse.json(
        {
          error: "Insufficient permissions.",
        },
        { status: 403 }
      );
    }

    // 3. Validate organization access
    if (!session.user.currentOrganizationId) {
      return NextResponse.json(
        { error: "No organization context found" },
        { status: 400 }
      );
    }

    // 4. Parse and validate request body
    const body = await request.json();
    const validatedData = createBulkApartmentsSchema.parse(body);

    // 5. Create apartments using service
    const result = await apartmentService.createBulkApartments({
      ...validatedData,
      organizationId: session.user.currentOrganizationId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create apartments" },
        { status: 500 }
      );
    }

    const bulkResult = result.data!;

    // 6. Return success response with detailed results
    return NextResponse.json(
      {
        success: true,
        message: `${bulkResult.successCount} apartments created successfully`,
        data: {
          total: bulkResult.total,
          successCount: bulkResult.successCount,
          errorCount: bulkResult.errorCount,
          created: bulkResult.created.map((apartment) => ({
            id: apartment.id,
            number: apartment.number,
            floor: apartment.floor,
            buildingId: apartment.buildingId,
            isOccupied: apartment.isOccupied,
            occupantCount: apartment.occupantCount,
            surface: apartment.surface,
            description: apartment.description,
            createdAt: apartment.createdAt.toISOString(),
            updatedAt: apartment.updatedAt.toISOString(),
          })),
          errors: bulkResult.errors,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Bulk apartment creation API error:",
      error instanceof Error ? error.message : String(error)
    );

    // Handle Zod validation errors
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as {
        issues: Array<{ path: (string | number)[]; message: string }>;
      };
      return NextResponse.json(
        {
          error: "Validation failed",
          details: zodError.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check permissions
    const hasReadPermission = await hasPermissionServerSide(
      session.user.permissions || [],
      ResourcesEnum.APARTMENTS,
      ActionsEnum.READ
    );

    if (!hasReadPermission) {
      return NextResponse.json(
        {
          error: "Insufficient permissions.",
        },
        { status: 403 }
      );
    }

    // 3. Validate organization access
    if (!session.user.currentOrganizationId) {
      return NextResponse.json(
        { error: "No organization context found" },
        { status: 400 }
      );
    }

    // 4. Parse query parameters
    const url = new URL(request.url);
    const buildingId = url.searchParams.get("buildingId");

    // 5. Fetch apartments using service
    const result = buildingId
      ? await apartmentService.getApartmentsByBuilding(
          buildingId,
          session.user.currentOrganizationId
        )
      : await apartmentService.getApartmentsByOrganization(
          session.user.currentOrganizationId
        );

    if (!result.success) {
      if (result.error?.includes("not found")) {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }

      return NextResponse.json(
        { error: result.error || "Failed to fetch apartments" },
        { status: 500 }
      );
    }

    // 6. Format response
    const formattedApartments = result.data!.map((apartment) => ({
      id: apartment.id,
      number: apartment.number,
      floor: apartment.floor,
      buildingId: apartment.buildingId,
      isOccupied: apartment.isOccupied,
      surface: apartment.surface,
      description: apartment.description,
      createdAt: apartment.createdAt.toISOString(),
      updatedAt: apartment.updatedAt.toISOString(),
      building: apartment.building,
      residentCount: apartment._count.apartmentResidents,
      waterMeterCount: apartment._count.waterMeters,
    }));

    return NextResponse.json({
      success: true,
      data: formattedApartments,
      total: formattedApartments.length,
    });
  } catch (error) {
    console.error(
      "Apartments fetch API error:",
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
