import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildingService } from "@/services/building.service";
import { createBuildingSchema } from "@/lib/validations/building";
import { hasPermissionServerSide } from "@/lib/auth-helpers";
import { ResourcesEnum, ActionsEnum } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    console.log("Session:", JSON.stringify(session, null, 2));

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check permissions
    const hasCreatePermission = await hasPermissionServerSide(
      session.user.permissions || [],
      ResourcesEnum.BUILDINGS,
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
    console.log("Request body:", JSON.stringify(body, null, 2));

    const validatedData = createBuildingSchema.parse(body);
    console.log("Validated data:", JSON.stringify(validatedData, null, 2));

    // 5. Create building using service
    const buildingInput = {
      ...validatedData,
      organizationId: session.user.currentOrganizationId,
    };
    console.log("Building input:", JSON.stringify(buildingInput, null, 2));

    const result = await buildingService.createBuilding(buildingInput);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create building" },
        { status: 500 }
      );
    }

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Building created successfully",
        data: {
          id: result.data!.id,
          name: result.data!.name,
          code: result.data!.code,
          address: result.data!.address,
          type: result.data!.type,
          floors: result.data!.floors,
          description: result.data!.description,
          readingDay: result.data!.readingDay,
          organizationId: result.data!.organizationId,
          createdAt: result.data!.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Avoid complex object logging that triggers Next.js source map bugs
    console.error(
      "Building creation API error:",
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

export async function GET(_request: NextRequest) {
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
      ResourcesEnum.BUILDINGS,
      ActionsEnum.READ
    );

    if (!hasReadPermission) {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. You need 'buildings:read' permission to view buildings.",
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

    // 4. Get buildings using service
    const result = await buildingService.getBuildingsByOrganization(
      session.user.currentOrganizationId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch buildings" },
        { status: 500 }
      );
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: result.data || [],
    });
  } catch (error) {
    console.error("Buildings fetch API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
