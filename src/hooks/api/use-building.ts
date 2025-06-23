import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type ApartmentData = {
  id: string;
  number: string;
  floor: number;
  isOccupied: boolean;
  surface: number | null;
};

export type BuildingWithApartments = {
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  organization: {
    id: string;
    name: string;
    code: string;
  };
  apartments: ApartmentData[];
  apartmentsByFloor: Record<string, ApartmentData[]>;
  occupiedApartments: number;
  vacantApartments: number;
};

export function useBuilding(buildingId: string, organizationId: string) {
  return useQuery({
    queryKey: ["building", buildingId, organizationId],
    queryFn: async (): Promise<BuildingWithApartments> => {
      const response = await api.get(`/buildings/${buildingId}`);
      return response.data.data;
    },
    enabled: !!buildingId && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
