"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type BuildingConsumptionStats = {
  lastMonth: {
    total: number;
    readingsCount: number;
    average: number;
    month: number;
    year: number;
  };
  sixMonths: {
    total: number;
    readingsCount: number;
    average: number;
    monthlyAverage: number;
  };
  monthlyBreakdown: Array<{
    month: number;
    year: number;
    consumption: number;
    readingsCount: number;
    monthName: string;
  }>;
  buildingInfo: {
    totalApartments: number;
    occupiedApartments: number;
  };
};

export function useBuildingConsumption(buildingId: string) {
  return useQuery({
    queryKey: ["building-consumption", buildingId],
    queryFn: async (): Promise<BuildingConsumptionStats> => {
      const response = await api.get<BuildingConsumptionStats>(
        `/buildings/${buildingId}/water-consumption`
      );
      return response.data;
    },
    enabled: !!buildingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
