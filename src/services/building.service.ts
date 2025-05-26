import { api } from "@/lib/axios";
import type {
  BuildingEntity,
  BuildingWithRelations,
  ApartmentWithRelations,
} from "@/types/entities";
import type { PaginatedResponse, PaginationParams } from "@/types/api";

export type CreateBuildingData = {
  name: string;
  address: string;
  readingDeadline: number;
  administratorId: string;
};

export type UpdateBuildingData = {
  name?: string;
  address?: string;
  readingDeadline?: number;
  administratorId?: string;
};

export type BuildingSearchParams = PaginationParams & {
  search?: string;
  administratorId?: string;
};

export type BuildingStatsResponse = {
  totalBuildings: number;
  totalApartments: number;
  averageApartmentsPerBuilding: number;
  buildingsWithPendingReadings: number;
};

export const buildingService = {
  // Get all buildings
  async getBuildings(
    params?: BuildingSearchParams
  ): Promise<PaginatedResponse<BuildingWithRelations>> {
    const response = await api.get<PaginatedResponse<BuildingWithRelations>>(
      "/buildings",
      { params }
    );
    return response.data;
  },

  // Get building by ID
  async getBuildingById(id: string): Promise<BuildingWithRelations> {
    const response = await api.get<BuildingWithRelations>(`/buildings/${id}`);
    return response.data;
  },

  // Create new building (admin only)
  async createBuilding(data: CreateBuildingData): Promise<BuildingEntity> {
    const response = await api.post<BuildingEntity>("/buildings", data);
    return response.data;
  },

  // Update building
  async updateBuilding(
    id: string,
    data: UpdateBuildingData
  ): Promise<BuildingEntity> {
    const response = await api.patch<BuildingEntity>(`/buildings/${id}`, data);
    return response.data;
  },

  // Delete building (admin only)
  async deleteBuilding(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/buildings/${id}`);
    return response.data;
  },

  // Get building statistics
  async getBuildingStats(): Promise<BuildingStatsResponse> {
    const response = await api.get<BuildingStatsResponse>("/buildings/stats");
    return response.data;
  },

  // Get apartments for a building
  async getBuildingApartments(
    buildingId: string
  ): Promise<ApartmentWithRelations[]> {
    const response = await api.get<ApartmentWithRelations[]>(
      `/buildings/${buildingId}/apartments`
    );
    return response.data;
  },

  // Search buildings
  async searchBuildings(query: string): Promise<BuildingEntity[]> {
    const response = await api.get<BuildingEntity[]>("/buildings/search", {
      params: { q: query },
    });
    return response.data;
  },
};
