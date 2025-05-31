"use client";

import { StatCard } from "@/components/ui/stat-card";
import { STAT_CARD_COLORS } from "@/lib/constants/colors";
import { useAdminDashboardStats } from "@/hooks/use-dashboard";
import { Building2, Home, Users, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboardStats() {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-4 lg:p-6 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-6 lg:h-8 lg:w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const adminStatsData = [
    {
      title: "Clădiri",
      value: stats.totalBuildings,
      icon: Building2,
      iconColor: STAT_CARD_COLORS.blue,
      trend: {
        value: 2,
        label: "față de luna trecută",
        type: "positive" as const,
      },
    },
    {
      title: "Apartamente",
      value: stats.totalApartments,
      icon: Home,
      iconColor: STAT_CARD_COLORS.green,
      trend: {
        value: 12,
        label: "față de luna trecută",
        type: "positive" as const,
      },
    },
    {
      title: "Utilizatori",
      value: stats.totalUsers,
      icon: Users,
      iconColor: STAT_CARD_COLORS.purple,
      trend: {
        value: 8,
        label: "față de luna trecută",
        type: "positive" as const,
      },
    },
    {
      title: "Citiri Apă",
      value: stats.totalReadings.toLocaleString(),
      icon: Droplets,
      iconColor: STAT_CARD_COLORS.cyan,
      trend: {
        value: stats.pendingReadings,
        label: "în așteptare",
        type: "neutral" as const,
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {adminStatsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          iconColor={stat.iconColor}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
