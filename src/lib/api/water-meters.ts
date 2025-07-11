import { api } from "@/lib/axios";
import type { WaterMeter } from "@prisma/client";
import type {
  CreateWaterMeterFormData,
  UpdateWaterMeterFormData,
  BulkCreateWaterMetersFormData,
} from "@/lib/validations/water-meter";
import type {
  WaterMeterListItem,
  WaterMeterWithReadings,
} from "@/services/water-meter.service";

export type WaterMeterResponse = {
  success: boolean;
  waterMeter: WaterMeter;
  message?: string;
};

export type WaterMetersResponse = {
  success: boolean;
  waterMeters: WaterMeterListItem[];
};

export type WaterMeterWithReadingsResponse = {
  success: boolean;
  waterMeter: WaterMeterWithReadings;
};

export type BulkWaterMetersResponse = {
  success: boolean;
  waterMeters: WaterMeter[];
  message?: string;
};

export type WaterMeterDeleteResponse = {
  success: boolean;
  message?: string;
};

/**
 * Get all water meters for a specific apartment
 */
export async function getWaterMetersByApartment(
  apartmentId: string
): Promise<WaterMetersResponse> {
  const response = await api.get<WaterMetersResponse>("/water-meters", {
    params: { apartmentId },
  });
  return response.data;
}

/**
 * Get a specific water meter by ID
 */
export async function getWaterMeterById(
  id: string
): Promise<WaterMeterWithReadingsResponse> {
  const response = await api.get<WaterMeterWithReadingsResponse>(
    `/water-meters/${id}`
  );
  return response.data;
}

/**
 * Create a new water meter
 */
export async function createWaterMeter(
  data: CreateWaterMeterFormData
): Promise<WaterMeterResponse> {
  const response = await api.post<WaterMeterResponse>("/water-meters", data);
  return response.data;
}

/**
 * Create multiple water meters in bulk
 */
export async function bulkCreateWaterMeters(
  data: BulkCreateWaterMetersFormData
): Promise<BulkWaterMetersResponse> {
  const response = await api.post<BulkWaterMetersResponse>(
    "/water-meters",
    data
  );
  return response.data;
}

/**
 * Update an existing water meter
 */
export async function updateWaterMeter(
  id: string,
  data: UpdateWaterMeterFormData
): Promise<WaterMeterResponse> {
  const response = await api.patch<WaterMeterResponse>(
    `/water-meters/${id}`,
    data
  );
  return response.data;
}

/**
 * Delete a water meter
 */
export async function deleteWaterMeter(
  id: string
): Promise<WaterMeterDeleteResponse> {
  const response = await api.delete<WaterMeterDeleteResponse>(
    `/water-meters/${id}`
  );
  return response.data;
}

/**
 * Toggle water meter active status
 */
export async function toggleWaterMeterStatus(
  id: string,
  isActive: boolean
): Promise<WaterMeterResponse> {
  const response = await api.patch<WaterMeterResponse>(`/water-meters/${id}`, {
    isActive,
  });
  return response.data;
}
