import { prisma } from "@/lib/prisma";
import {
  ApiResponse,
  createServiceError,
  createServiceSuccess,
} from "@/types/api";
import { PermissionService } from "./permission.service";
import type {
  DashboardStats,
  OwnerDashboardStats,
  ActivityItem,
} from "./dashboard.service";

export class DashboardStatsService {
  /**
   * Get admin dashboard statistics
   */
  static async getAdminStats(tenantContext: {
    userId: string;
    administratorId?: string;
  }): Promise<ApiResponse<DashboardStats>> {
    try {
      // Check permissions
      const hasPermission = await this.checkAdminPermissions(
        tenantContext.userId
      );
      if (!hasPermission || !tenantContext.administratorId) {
        return createServiceError(
          "FORBIDDEN",
          "Nu ai permisiunea să accesezi statisticile administrative"
        );
      }

      // Get all stats in parallel for this admin's buildings only
      const [counts, recentActivity] = await Promise.all([
        this.getAdminCounts(tenantContext.administratorId),
        this.getRecentActivity(10, tenantContext.administratorId),
      ]);

      return createServiceSuccess({
        ...counts,
        recentActivity:
          recentActivity.success && recentActivity.data
            ? recentActivity.data
            : [],
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la încărcarea statisticilor administrative"
      );
    }
  }

  /**
   * Get owner dashboard statistics
   */
  static async getOwnerStats(tenantContext: {
    userId: string;
    ownerId?: string;
  }): Promise<ApiResponse<OwnerDashboardStats>> {
    try {
      // Check permissions
      const hasPermission = await this.checkOwnerPermissions(
        tenantContext.userId,
        tenantContext.ownerId
      );
      if (!hasPermission) {
        return createServiceError(
          "FORBIDDEN",
          "Nu ai permisiunea să accesezi statisticile proprietarului"
        );
      }

      // Get all stats in parallel
      const [apartments, pendingReadings, monthlyConsumption, recentActivity] =
        await Promise.all([
          this.getOwnerApartments(tenantContext.ownerId!),
          this.getOwnerPendingReadings(tenantContext.ownerId!),
          this.calculateMonthlyConsumption(tenantContext.ownerId!),
          this.getOwnerRecentActivity(tenantContext.ownerId!, 5),
        ]);

      const lastReading = this.getLastReadingFromApartments(apartments);

      return createServiceSuccess({
        totalApartments: apartments.length,
        pendingReadings,
        lastReading,
        monthlyConsumption,
        recentActivity:
          recentActivity.success && recentActivity.data
            ? recentActivity.data
            : [],
      });
    } catch (error) {
      console.error("Error fetching owner stats:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la încărcarea statisticilor proprietarului"
      );
    }
  }

  /**
   * Check if user has admin permissions
   */
  private static async checkAdminPermissions(userId: string): Promise<boolean> {
    return await PermissionService.hasPermission(userId, {
      resource: "buildings",
      action: "read",
      scope: "all",
    });
  }

  /**
   * Check if user has owner permissions
   */
  private static async checkOwnerPermissions(
    userId: string,
    ownerId?: string
  ): Promise<boolean> {
    if (!ownerId) return false;

    return await PermissionService.hasPermission(userId, {
      resource: "apartments",
      action: "read",
      scope: "own",
    });
  }

  /**
   * Get admin dashboard counts for specific administrator
   */
  private static async getAdminCounts(administratorId: string): Promise<{
    totalUsers: number;
    totalBuildings: number;
    totalApartments: number;
    totalReadings: number;
    pendingReadings: number;
  }> {
    // Get buildings managed by this administrator
    const adminBuildings = await prisma.building.findMany({
      where: { administratorId },
      select: { id: true },
    });

    const buildingIds = adminBuildings.map((building) => building.id);

    // If no buildings, return zeros
    if (buildingIds.length === 0) {
      return {
        totalUsers: 0,
        totalBuildings: 0,
        totalApartments: 0,
        totalReadings: 0,
        pendingReadings: 0,
      };
    }

    const [
      totalUsers,
      totalBuildings,
      totalApartments,
      totalReadings,
      pendingReadings,
    ] = await Promise.all([
      // Count users who have apartments in admin's buildings
      prisma.user.count({
        where: {
          OR: [
            // Users who own apartments in admin's buildings
            {
              owner: {
                apartments: {
                  some: {
                    buildingId: { in: buildingIds },
                  },
                },
              },
            },
            // Users who manage apartments in admin's buildings
            {
              apartmentManagers: {
                some: {
                  apartment: {
                    buildingId: { in: buildingIds },
                  },
                },
              },
            },
          ],
        },
      }),
      // Count buildings managed by this admin
      prisma.building.count({
        where: { administratorId },
      }),
      // Count apartments in admin's buildings
      prisma.apartment.count({
        where: { buildingId: { in: buildingIds } },
      }),
      // Count water readings in admin's buildings
      prisma.waterReading.count({
        where: {
          apartment: {
            buildingId: { in: buildingIds },
          },
        },
      }),
      // Count pending readings in admin's buildings
      prisma.waterReading.count({
        where: {
          apartment: {
            buildingId: { in: buildingIds },
          },
          isValidated: false,
        },
      }),
    ]);

    return {
      totalUsers,
      totalBuildings,
      totalApartments,
      totalReadings,
      pendingReadings,
    };
  }

  /**
   * Get owner's apartments with last reading
   */
  private static async getOwnerApartments(ownerId: string) {
    return await prisma.apartment.findMany({
      where: { ownerId },
      include: {
        waterReadings: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }

  /**
   * Get owner's pending readings count
   */
  private static async getOwnerPendingReadings(
    ownerId: string
  ): Promise<number> {
    return await prisma.waterReading.count({
      where: {
        apartment: { ownerId },
        isValidated: false,
      },
    });
  }

  /**
   * Extract last reading from apartments data
   */
  private static getLastReadingFromApartments(
    apartments: Array<{
      id: string;
      number: string;
      waterReadings: Array<{
        id: string;
        reading: number;
        createdAt: Date;
      }>;
    }>
  ): { date: string; value: number; apartment: string } | undefined {
    const apartmentWithLastReading = apartments.find(
      (apt) => apt.waterReadings.length > 0
    );

    if (apartmentWithLastReading && apartmentWithLastReading.waterReadings[0]) {
      const reading = apartmentWithLastReading.waterReadings[0];
      return {
        date: reading.createdAt.toISOString(),
        value: reading.reading,
        apartment: apartmentWithLastReading.number,
      };
    }

    return undefined;
  }

  /**
   * Calculate monthly consumption for owner
   */
  private static async calculateMonthlyConsumption(
    ownerId: string
  ): Promise<number> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Get current and previous month readings
    const [currentMonthReadings, previousMonthReadings] = await Promise.all([
      this.getMonthReadings(ownerId, currentMonth, currentYear),
      this.getMonthReadings(
        ownerId,
        currentMonth === 1 ? 12 : currentMonth - 1,
        currentMonth === 1 ? currentYear - 1 : currentYear
      ),
    ]);

    // Calculate consumption
    let monthlyConsumption = 0;

    for (const currentReading of currentMonthReadings) {
      const previousReading = previousMonthReadings.find(
        (prev) => prev.apartmentId === currentReading.apartmentId
      );

      if (previousReading) {
        const consumption = currentReading.reading - previousReading.reading;
        monthlyConsumption += Math.max(0, consumption);
      } else if (currentReading.consumption && currentReading.consumption > 0) {
        monthlyConsumption += currentReading.consumption;
      }
    }

    // Round to 2 decimal places
    monthlyConsumption = Math.round(monthlyConsumption * 100) / 100;

    // Fallback estimate if no readings
    if (monthlyConsumption === 0) {
      const apartmentCount = await prisma.apartment.count({
        where: { ownerId },
      });
      if (apartmentCount > 0) {
        monthlyConsumption = apartmentCount * 12; // 12 cubic meters per apartment
      }
    }

    return monthlyConsumption;
  }

  /**
   * Get water readings for a specific month and year
   */
  private static async getMonthReadings(
    ownerId: string,
    month: number,
    year: number
  ) {
    return await prisma.waterReading.findMany({
      where: {
        apartment: { ownerId },
        month,
        year,
      },
      select: {
        id: true,
        apartmentId: true,
        reading: true,
        consumption: true,
      },
    });
  }

  /**
   * Get recent activity for admin dashboard (scoped to admin's buildings)
   */
  private static async getRecentActivity(
    limit: number,
    administratorId?: string
  ): Promise<ApiResponse<ActivityItem[]>> {
    try {
      // If no administratorId provided, return empty activity
      if (!administratorId) {
        return createServiceSuccess([]);
      }

      // Get buildings managed by this administrator
      const adminBuildings = await prisma.building.findMany({
        where: { administratorId },
        select: { id: true },
      });

      const buildingIds = adminBuildings.map((building) => building.id);

      // If no buildings, return empty activity
      if (buildingIds.length === 0) {
        return createServiceSuccess([]);
      }

      const [recentUsers, recentBuildings, recentReadings] = await Promise.all([
        this.getRecentUsers(Math.ceil(limit / 3), buildingIds),
        this.getRecentBuildings(Math.ceil(limit / 3), administratorId),
        this.getRecentReadings(Math.ceil(limit / 3), buildingIds),
      ]);

      const activities = [
        ...this.formatUserActivities(recentUsers),
        ...this.formatBuildingActivities(recentBuildings),
        ...this.formatReadingActivities(recentReadings),
      ];

      // Sort by timestamp and limit
      const sortedActivities = activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);

      return createServiceSuccess(sortedActivities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la încărcarea activității recente"
      );
    }
  }

  /**
   * Get recent users (scoped to admin's buildings)
   */
  private static async getRecentUsers(limit: number, buildingIds: string[]) {
    return await prisma.user.findMany({
      where: {
        OR: [
          // Users who own apartments in admin's buildings
          {
            owner: {
              apartments: {
                some: {
                  buildingId: { in: buildingIds },
                },
              },
            },
          },
          // Users who manage apartments in admin's buildings
          {
            apartmentManagers: {
              some: {
                apartment: {
                  buildingId: { in: buildingIds },
                },
              },
            },
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get recent buildings (scoped to admin)
   */
  private static async getRecentBuildings(
    limit: number,
    administratorId: string
  ) {
    return await prisma.building.findMany({
      where: { administratorId },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get recent water readings (scoped to admin's buildings)
   */
  private static async getRecentReadings(limit: number, buildingIds: string[]) {
    return await prisma.waterReading.findMany({
      where: {
        apartment: {
          buildingId: { in: buildingIds },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        apartment: {
          select: {
            number: true,
            building: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  /**
   * Format user activities
   */
  private static formatUserActivities(
    users: Array<{
      id: string;
      firstName: string;
      lastName: string;
      createdAt: Date;
    }>
  ): ActivityItem[] {
    return users.map((user) => ({
      id: `user-${user.id}`,
      type: "user" as const,
      description: `Utilizator nou înregistrat: ${user.firstName} ${user.lastName}`,
      timestamp: user.createdAt.toISOString(),
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }));
  }

  /**
   * Format building activities
   */
  private static formatBuildingActivities(
    buildings: Array<{
      id: string;
      name: string;
      createdAt: Date;
    }>
  ): ActivityItem[] {
    return buildings.map((building) => ({
      id: `building-${building.id}`,
      type: "building" as const,
      description: `Clădire nouă adăugată: ${building.name}`,
      timestamp: building.createdAt.toISOString(),
    }));
  }

  /**
   * Format reading activities
   */
  private static formatReadingActivities(
    readings: Array<{
      id: string;
      createdAt: Date;
      apartment: {
        number: string;
        building: {
          name: string;
        };
      };
    }>
  ): ActivityItem[] {
    return readings.map((reading) => ({
      id: `reading-${reading.id}`,
      type: "reading" as const,
      description: `Citire nouă: ${reading.apartment.number} - ${reading.apartment.building.name}`,
      timestamp: reading.createdAt.toISOString(),
    }));
  }

  /**
   * Get recent activity for owner dashboard
   */
  private static async getOwnerRecentActivity(
    ownerId: string,
    limit: number
  ): Promise<ApiResponse<ActivityItem[]>> {
    try {
      const recentReadings = await prisma.waterReading.findMany({
        where: {
          apartment: { ownerId },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          apartment: {
            select: {
              number: true,
              building: {
                select: { name: true },
              },
            },
          },
        },
      });

      const activities = this.formatOwnerReadingActivities(recentReadings);
      return createServiceSuccess(activities);
    } catch (error) {
      console.error("Error fetching owner recent activity:", error);
      return createServiceError(
        "INTERNAL_ERROR",
        "Eroare la încărcarea activității recente"
      );
    }
  }

  /**
   * Format owner reading activities
   */
  private static formatOwnerReadingActivities(
    readings: Array<{
      id: string;
      createdAt: Date;
      apartment: {
        number: string;
        building: {
          name: string;
        };
      };
    }>
  ): ActivityItem[] {
    return readings.map((reading) => ({
      id: `reading-${reading.id}`,
      type: "reading" as const,
      description: `Citire nouă pentru apartamentul ${reading.apartment.number} - ${reading.apartment.building.name}`,
      timestamp: reading.createdAt.toISOString(),
    }));
  }
}
