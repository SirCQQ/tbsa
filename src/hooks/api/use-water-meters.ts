import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as waterMeterApi from "@/lib/api/water-meters";
import type {
  CreateWaterMeterFormData,
  UpdateWaterMeterFormData,
  BulkCreateWaterMetersFormData,
} from "@/lib/validations/water-meter";
import type {
  WaterMeterResponse,
  BulkWaterMetersResponse,
  WaterMeterDeleteResponse,
} from "@/lib/api/water-meters";

// Query Keys
export const waterMeterKeys = {
  all: ["waterMeters"] as const,
  byApartment: (apartmentId: string) =>
    [...waterMeterKeys.all, "apartment", apartmentId] as const,
  detail: (id: string) => [...waterMeterKeys.all, "detail", id] as const,
};

// ============ QUERIES ============

/**
 * Get water meters for a specific apartment
 */
export function useWaterMetersByApartment(apartmentId: string) {
  return useQuery({
    queryKey: waterMeterKeys.byApartment(apartmentId),
    queryFn: () => waterMeterApi.getWaterMetersByApartment(apartmentId),
    enabled: !!apartmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a specific water meter by ID
 */
export function useWaterMeter(id: string) {
  return useQuery({
    queryKey: waterMeterKeys.detail(id),
    queryFn: () => waterMeterApi.getWaterMeterById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============ MUTATIONS ============

/**
 * Create a new water meter
 */
export function useCreateWaterMeter(
  options?: UseMutationOptions<
    WaterMeterResponse,
    AxiosError,
    CreateWaterMeterFormData
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: waterMeterApi.createWaterMeter,
    onSuccess: (data, variables, context) => {
      // Invalidate apartment's water meters list
      queryClient.invalidateQueries({
        queryKey: waterMeterKeys.byApartment(variables.apartmentId),
      });

      // Invalidate all water meters
      queryClient.invalidateQueries({
        queryKey: waterMeterKeys.all,
      });

      // Call user-provided onSuccess callback
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Create water meter error:", error);
      onError?.(error, variables, context);
    },
    ...rest,
  });
}

/**
 * Create multiple water meters in bulk
 */
export function useBulkCreateWaterMeters(
  options?: UseMutationOptions<
    BulkWaterMetersResponse,
    AxiosError,
    BulkCreateWaterMetersFormData
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: waterMeterApi.bulkCreateWaterMeters,
    onSuccess: (data, variables, context) => {
      // Invalidate apartment's water meters list
      queryClient.invalidateQueries({
        queryKey: waterMeterKeys.byApartment(variables.apartmentId),
      });

      // Invalidate all water meters
      queryClient.invalidateQueries({
        queryKey: waterMeterKeys.all,
      });

      // Call user-provided onSuccess callback
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Bulk create water meters error:", error);
      onError?.(error, variables, context);
    },
    ...rest,
  });
}

/**
 * Update an existing water meter
 */
export function useUpdateWaterMeter(
  options?: UseMutationOptions<
    WaterMeterResponse,
    AxiosError,
    { id: string; data: UpdateWaterMeterFormData }
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: ({ id, data }) => waterMeterApi.updateWaterMeter(id, data),
    onSuccess: (data, variables, context) => {
      // Invalidate specific water meter
      queryClient.invalidateQueries({
        queryKey: waterMeterKeys.detail(variables.id),
      });

      // Invalidate all water meters
      queryClient.invalidateQueries({
        queryKey: waterMeterKeys.all,
      });

      // Call user-provided onSuccess callback
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Update water meter error:", error);
      onError?.(error, variables, context);
    },
    ...rest,
  });
}

/**
 * Delete a water meter
 */
export function useDeleteWaterMeter(
  options?: UseMutationOptions<WaterMeterDeleteResponse, AxiosError, string>
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: waterMeterApi.deleteWaterMeter,
    onSuccess: (data, variables, context) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: waterMeterKeys.detail(variables),
      });

      // Invalidate all water meters
      queryClient.invalidateQueries({
        queryKey: waterMeterKeys.all,
      });

      // Call user-provided onSuccess callback
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Delete water meter error:", error);
      onError?.(error, variables, context);
    },
    ...rest,
  });
}

/**
 * Toggle water meter active status
 */
export function useToggleWaterMeterStatus(
  options?: UseMutationOptions<
    WaterMeterResponse,
    AxiosError,
    { id: string; isActive: boolean }
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: ({ id, isActive }) =>
      waterMeterApi.toggleWaterMeterStatus(id, isActive),
    onSuccess: (data, variables, context) => {
      // Invalidate specific water meter
      queryClient.invalidateQueries({
        queryKey: waterMeterKeys.detail(variables.id),
      });

      // Invalidate all water meters
      queryClient.invalidateQueries({
        queryKey: waterMeterKeys.all,
      });

      // Call user-provided onSuccess callback
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Toggle water meter status error:", error);
      onError?.(error, variables, context);
    },
    ...rest,
  });
}
