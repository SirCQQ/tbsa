import { api } from "@/lib/axios";
import type {
  ApartmentEntity,
  ApartmentWithRelations,
  WaterReadingWithRelations,
} from "@/types/entities";
import type { PaginatedResponse, PaginationParams } from "@/types/api";

export type CreateApartmentData = {
  number: string;
  buildingId: string;
  ownerId?: string;
};

export type UpdateApartmentData = {
  number?: string;
  buildingId?: string;
  ownerId?: string;
};

export type ApartmentSearchParams = PaginationParams & {
  search?: string;
  buildingId?: string;
  ownerId?: string;
  hasOwner?: boolean;
};

export type ApartmentStatsResponse = {
  totalApartments: number;
  occupiedApartments: number;
  vacantApartments: number;
  occupancyRate: number;
  apartmentsWithPendingReadings: number;
};

export const apartmentService = {
  // Get all apartments
  async getApartments(
    params?: ApartmentSearchParams
  ): Promise<PaginatedResponse<ApartmentWithRelations>> {
    const response = await api.get<PaginatedResponse<ApartmentWithRelations>>(
      "/apartments",
      { params }
    );
    return response.data;
  },

  // Get apartment by ID
  async getApartmentById(id: string): Promise<ApartmentWithRelations> {
    const response = await api.get<ApartmentWithRelations>(`/apartments/${id}`);
    return response.data;
  },

  // Create new apartment
  async createApartment(data: CreateApartmentData): Promise<ApartmentEntity> {
    const response = await api.post<ApartmentEntity>("/apartments", data);
    return response.data;
  },

  // Update apartment
  async updateApartment(
    id: string,
    data: UpdateApartmentData
  ): Promise<ApartmentEntity> {
    const response = await api.patch<ApartmentEntity>(
      `/apartments/${id}`,
      data
    );
    return response.data;
  },

  // Delete apartment
  async deleteApartment(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/apartments/${id}`);
    return response.data;
  },

  // Get apartment statistics
  async getApartmentStats(): Promise<ApartmentStatsResponse> {
    const response = await api.get<ApartmentStatsResponse>("/apartments/stats");
    return response.data;
  },

  // Get apartments by owner
  async getApartmentsByOwner(
    ownerId: string
  ): Promise<ApartmentWithRelations[]> {
    const response = await api.get<ApartmentWithRelations[]>(
      `/apartments/owner/${ownerId}`
    );
    return response.data;
  },

  // Get apartments by building
  async getApartmentsByBuilding(
    buildingId: string
  ): Promise<ApartmentWithRelations[]> {
    const response = await api.get<ApartmentWithRelations[]>(
      `/apartments/building/${buildingId}`
    );
    return response.data;
  },

  // Get water readings for apartment
  async getApartmentReadings(
    apartmentId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<WaterReadingWithRelations[]> {
    const response = await api.get<WaterReadingWithRelations[]>(
      `/apartments/${apartmentId}/readings`,
      { params }
    );
    return response.data;
  },

  // Assign owner to apartment
  async assignOwner(
    apartmentId: string,
    ownerId: string
  ): Promise<ApartmentEntity> {
    const response = await api.patch<ApartmentEntity>(
      `/apartments/${apartmentId}/assign-owner`,
      { ownerId }
    );
    return response.data;
  },

  // Remove owner from apartment
  async removeOwner(apartmentId: string): Promise<ApartmentEntity> {
    const response = await api.patch<ApartmentEntity>(
      `/apartments/${apartmentId}/remove-owner`
    );
    return response.data;
  },

  // Search apartments
  async searchApartments(query: string): Promise<ApartmentEntity[]> {
    const response = await api.get<ApartmentEntity[]>("/apartments/search", {
      params: { q: query },
    });
    return response.data;
  },
};
