import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/services/auth-server.service";
import { hasPermission } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: buildingId } = await params;
    const authResult = await getCurrentUser();

    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    // Check if user has permission to access building consumption data
    const canViewConsumption = await hasPermission({
      resource: "water_readings",
      action: "read",
      scope: "building",
    });

    if (!canViewConsumption) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Verify building belongs to this administrator
    const building = await prisma.building.findFirst({
      where: {
        id: buildingId,
        administratorId: user.administrator?.id,
      },
    });

    if (!building) {
      return NextResponse.json(
        { error: "Building not found" },
        { status: 404 }
      );
    }

    // Get current date for calculations
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Calculate last month
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Calculate 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get last month consumption
    const lastMonthConsumption = await prisma.waterReading.aggregate({
      where: {
        apartment: {
          buildingId: buildingId,
        },
        month: lastMonth,
        year: lastMonthYear,
        consumption: {
          not: null,
        },
      },
      _sum: {
        consumption: true,
      },
      _count: {
        id: true,
      },
    });

    // Get last 6 months consumption
    const sixMonthsConsumption = await prisma.waterReading.aggregate({
      where: {
        apartment: {
          buildingId: buildingId,
        },
        OR: [
          {
            year: { gt: sixMonthsAgo.getFullYear() },
          },
          {
            year: sixMonthsAgo.getFullYear(),
            month: { gte: sixMonthsAgo.getMonth() + 1 },
          },
        ],
        consumption: {
          not: null,
        },
      },
      _sum: {
        consumption: true,
      },
      _count: {
        id: true,
      },
    });

    // Get monthly breakdown for last 6 months
    const monthlyBreakdown = await prisma.waterReading.groupBy({
      by: ["month", "year"],
      where: {
        apartment: {
          buildingId: buildingId,
        },
        OR: [
          {
            year: { gt: sixMonthsAgo.getFullYear() },
          },
          {
            year: sixMonthsAgo.getFullYear(),
            month: { gte: sixMonthsAgo.getMonth() + 1 },
          },
        ],
        consumption: {
          not: null,
        },
      },
      _sum: {
        consumption: true,
      },
      _count: {
        id: true,
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    // Calculate average consumption per apartment
    const totalApartments = await prisma.apartment.count({
      where: {
        buildingId: buildingId,
        ownerId: { not: null }, // Only occupied apartments
      },
    });

    const response = {
      lastMonth: {
        total: lastMonthConsumption._sum.consumption || 0,
        readingsCount: lastMonthConsumption._count.id,
        average:
          totalApartments > 0
            ? (lastMonthConsumption._sum.consumption || 0) / totalApartments
            : 0,
        month: lastMonth,
        year: lastMonthYear,
      },
      sixMonths: {
        total: sixMonthsConsumption._sum.consumption || 0,
        readingsCount: sixMonthsConsumption._count.id,
        average:
          totalApartments > 0
            ? (sixMonthsConsumption._sum.consumption || 0) / totalApartments / 6
            : 0,
        monthlyAverage:
          monthlyBreakdown.length > 0
            ? (sixMonthsConsumption._sum.consumption || 0) /
              monthlyBreakdown.length
            : 0,
      },
      monthlyBreakdown: monthlyBreakdown.map((item) => ({
        month: item.month,
        year: item.year,
        consumption: item._sum.consumption || 0,
        readingsCount: item._count.id,
        monthName: new Date(item.year, item.month - 1).toLocaleDateString(
          "ro-RO",
          {
            month: "long",
            year: "numeric",
          }
        ),
      })),
      buildingInfo: {
        totalApartments,
        occupiedApartments: totalApartments, // Since we're only counting occupied ones
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching building water consumption:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
