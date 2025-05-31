"use client";

import { StatCard } from "@/components/ui/stat-card";
import { STAT_CARD_COLORS } from "@/lib/constants/colors";
import { useOwnerDashboardStats } from "@/hooks/use-dashboard";
import { Building2, Home, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function OwnerDashboardStats() {
  const { data: stats, isLoading } = useOwnerDashboardStats();

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

  const ownerStatsData = [
    {
      title: "Apartamentele Mele",
      value: stats.totalApartments,
      icon: Home,
      iconColor: STAT_CARD_COLORS.green,
      trend: {
        value: 0,
        label: "apartamente",
        type: "neutral" as const,
      },
    },
    {
      title: "Citiri în Așteptare",
      value: stats.pendingReadings,
      icon: Droplets,
      iconColor: STAT_CARD_COLORS.orange,
      trend: {
        value: stats.pendingReadings,
        label: "de completat",
        type:
          stats.pendingReadings > 0
            ? ("negative" as const)
            : ("positive" as const),
      },
    },
    {
      title: "Consum Lunar",
      value: `${stats.monthlyConsumption} m³`,
      icon: Droplets,
      iconColor: STAT_CARD_COLORS.cyan,
      trend: {
        value: 5,
        label: "față de luna trecută",
        type: "positive" as const,
      },
    },
    {
      title: "Ultima Citire",
      value: stats.lastReading ? `${stats.lastReading.value} m³` : "N/A",
      icon: Building2,
      iconColor: STAT_CARD_COLORS.blue,
      trend: {
        value: 0,
        label: stats.lastReading
          ? new Date(stats.lastReading.date).toLocaleDateString("ro-RO")
          : "Nicio citire",
        type: "neutral" as const,
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {ownerStatsData.map((stat, index) => (
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
