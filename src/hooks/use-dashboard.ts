"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { queryKeys } from "@/lib/react-query";
import type { ConsumptionPeriod } from "@/services/dashboard.service";

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: dashboardService.getAdminStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useOwnerDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: dashboardService.getOwnerStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.dashboard.activity(), limit],
    queryFn: () => dashboardService.getRecentActivity(limit),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

export function useMonthlyStats(months = 12) {
  return useQuery({
    queryKey: ["dashboard", "monthly-stats", months],
    queryFn: () => dashboardService.getMonthlyStats(months),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useConsumptionTrends(period: ConsumptionPeriod = "month") {
  return useQuery({
    queryKey: ["dashboard", "consumption-trends", period],
    queryFn: () => dashboardService.getConsumptionTrends(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUserGrowth() {
  return useQuery({
    queryKey: ["dashboard", "user-growth"],
    queryFn: dashboardService.getUserGrowth,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useBuildingOccupancy() {
  return useQuery({
    queryKey: ["dashboard", "building-occupancy"],
    queryFn: dashboardService.getBuildingOccupancy,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
