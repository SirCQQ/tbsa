import { NextRequest, NextResponse } from "next/server";

import { apartmentService } from "@/services/apartment.service";
import { createBulkApartmentsSchema } from "@/lib/validations/apartment";

import { ResourcesEnum, ActionsEnum } from "@prisma/client";
import { withAuth } from "@/lib/withAuth";
import { ApartmentController } from "@/controllers/apartments.controller";

export async function POST(request: NextRequest) {
  return withAuth(ApartmentController.createApartment, [
    { resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.CREATE },
  ])(request);
}

export async function PUT(request: NextRequest) {
  return withAuth(
    async (request, session) => {
      try {
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
    },
    [{ resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.CREATE }],
    true
  )(request);
}

export async function GET(request: NextRequest) {
  return withAuth(
    async (request, session) => {
      try {
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
    },
    [{ resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.READ }],
    true
  )(request);
}
