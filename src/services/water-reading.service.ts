import { api } from "@/lib/axios";
import type {
  WaterReadingEntity,
  WaterReadingWithRelations,
} from "@/types/entities";
import type { PaginatedResponse, PaginationParams } from "@/types/api";

export type CreateWaterReadingData = {
  value: number;
  readingDate: string;
  apartmentId: string;
  notes?: string;
};

export type UpdateWaterReadingData = {
  value?: number;
  readingDate?: string;
  notes?: string;
  validated?: boolean;
};

export type WaterReadingSearchParams = PaginationParams & {
  apartmentId?: string;
  buildingId?: string;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
  validated?: boolean;
};

export type WaterReadingStatsResponse = {
  totalReadings: number;
  pendingReadings: number;
  validatedReadings: number;
  averageConsumption: number;
  monthlyConsumption: number;
  lastReadingDate?: string;
};

export type ConsumptionAnalysis = {
  apartmentId: string;
  apartmentNumber: string;
  buildingName: string;
  currentReading: number;
  previousReading: number;
  consumption: number;
  readingDate: string;
  previousReadingDate: string;
  daysElapsed: number;
  dailyAverage: number;
};

export const waterReadingService = {
  // Get all water readings
  async getWaterReadings(
    params?: WaterReadingSearchParams
  ): Promise<PaginatedResponse<WaterReadingWithRelations>> {
    const response = await api.get<
      PaginatedResponse<WaterReadingWithRelations>
    >("/water-readings", { params });
    return response.data;
  },

  // Get water reading by ID
  async getWaterReadingById(id: string): Promise<WaterReadingWithRelations> {
    const response = await api.get<WaterReadingWithRelations>(
      `/water-readings/${id}`
    );
    return response.data;
  },

  // Create new water reading
  async createWaterReading(
    data: CreateWaterReadingData
  ): Promise<WaterReadingEntity> {
    const response = await api.post<WaterReadingEntity>(
      "/water-readings",
      data
    );
    return response.data;
  },

  // Update water reading
  async updateWaterReading(
    id: string,
    data: UpdateWaterReadingData
  ): Promise<WaterReadingEntity> {
    const response = await api.patch<WaterReadingEntity>(
      `/water-readings/${id}`,
      data
    );
    return response.data;
  },

  // Delete water reading
  async deleteWaterReading(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/water-readings/${id}`
    );
    return response.data;
  },

  // Validate water reading (admin only)
  async validateWaterReading(id: string): Promise<WaterReadingEntity> {
    const response = await api.patch<WaterReadingEntity>(
      `/water-readings/${id}/validate`
    );
    return response.data;
  },

  // Bulk validate water readings (admin only)
  async bulkValidateWaterReadings(
    ids: string[]
  ): Promise<{ message: string; validatedCount: number }> {
    const response = await api.patch<{
      message: string;
      validatedCount: number;
    }>("/water-readings/bulk-validate", { ids });
    return response.data;
  },

  // Get water reading statistics
  async getWaterReadingStats(params?: {
    apartmentId?: string;
    buildingId?: string;
    ownerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<WaterReadingStatsResponse> {
    const response = await api.get<WaterReadingStatsResponse>(
      "/water-readings/stats",
      { params }
    );
    return response.data;
  },

  // Get consumption analysis
  async getConsumptionAnalysis(params?: {
    buildingId?: string;
    ownerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ConsumptionAnalysis[]> {
    const response = await api.get<ConsumptionAnalysis[]>(
      "/water-readings/consumption-analysis",
      { params }
    );
    return response.data;
  },

  // Get pending readings
  async getPendingReadings(params?: {
    buildingId?: string;
    limit?: number;
  }): Promise<WaterReadingWithRelations[]> {
    const response = await api.get<WaterReadingWithRelations[]>(
      "/water-readings/pending",
      { params }
    );
    return response.data;
  },

  // Get readings by apartment
  async getReadingsByApartment(
    apartmentId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<WaterReadingWithRelations[]> {
    const response = await api.get<WaterReadingWithRelations[]>(
      `/water-readings/apartment/${apartmentId}`,
      { params }
    );
    return response.data;
  },

  // Get readings by owner
  async getReadingsByOwner(
    ownerId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<WaterReadingWithRelations[]> {
    const response = await api.get<WaterReadingWithRelations[]>(
      `/water-readings/owner/${ownerId}`,
      { params }
    );
    return response.data;
  },

  // Export readings to CSV
  async exportReadings(params?: {
    buildingId?: string;
    startDate?: string;
    endDate?: string;
    format?: "csv" | "xlsx";
  }): Promise<Blob> {
    const response = await api.get("/water-readings/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};
