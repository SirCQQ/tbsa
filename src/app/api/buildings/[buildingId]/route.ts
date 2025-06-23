import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildingService } from "@/services/building.service";
import { hasPermissionServerSide } from "@/lib/auth-helpers";
import { ResourcesEnum, ActionsEnum } from "@prisma/client";

type ApartmentData = {
  id: string;
  number: string;
  floor: number;
  isOccupied: boolean;
  surface: number | null;
};

type BuildingWithApartments = {
  id: string;
  name: string;
  code: string;
  address: string;
  type: string;
  floors: number;
  totalApartments: number;
  organizationId: string;
  description: string | null;
  readingDay: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  organization: {
    id: string;
    name: string;
    code: string;
  };
  apartments: ApartmentData[];
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buildingId: string }> }
) {
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
      ResourcesEnum.BUILDINGS.toLowerCase(),
      ActionsEnum.READ.toLowerCase()
    );

    if (!hasReadPermission) {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. You need 'buildings:read' permission to view building details.",
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

    // 4. Get building ID from params
    const { buildingId } = await params;

    if (!buildingId) {
      return NextResponse.json(
        { error: "Building ID is required" },
        { status: 400 }
      );
    }

    // 5. Get building using service
    const result = await buildingService.getBuildingById(
      buildingId,
      session.user.currentOrganizationId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch building" },
        { status: 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { error: "Building not found" },
        { status: 404 }
      );
    }

    // 6. Organize apartments by floor
    const building = result.data as BuildingWithApartments;
    const apartmentsByFloor: Record<string, ApartmentData[]> = {};

    // Group apartments by floor
    building.apartments.forEach((apartment: ApartmentData) => {
      const floorKey = apartment.floor.toString();
      if (!apartmentsByFloor[floorKey]) {
        apartmentsByFloor[floorKey] = [];
      }
      apartmentsByFloor[floorKey].push(apartment);
    });

    // Sort apartments within each floor by number
    Object.keys(apartmentsByFloor).forEach((floor) => {
      apartmentsByFloor[floor].sort((a: ApartmentData, b: ApartmentData) => {
        // Try to sort numerically first, then alphabetically
        const numA = parseInt(a.number);
        const numB = parseInt(b.number);

        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }

        return a.number.localeCompare(b.number);
      });
    });

    // 7. Return success response with organized data
    return NextResponse.json({
      success: true,
      data: {
        ...building,
        apartmentsByFloor,
        totalApartments: building.apartments.length,
        occupiedApartments: building.apartments.filter(
          (apt: ApartmentData) => apt.isOccupied
        ).length,
        vacantApartments: building.apartments.filter(
          (apt: ApartmentData) => !apt.isOccupied
        ).length,
      },
    });
  } catch (error) {
    console.error("Building fetch API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
