import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  buildingsApi,
  type CreateBuildingResponse,
  type GetBuildingsResponse,
  type GetBuildingStatsResponse,
  type BuildingErrorResponse,
  type BuildingWithOrganization,
  type BuildingStatsResponse,
} from "@/lib/api/buildings";
import { getErrorMessage } from "@/lib/axios";
import type { CreateBuildingFormData } from "@/lib/validations/building";
import type { AxiosError } from "axios";
import { organizationQueryKeys } from "./use-organizations";

// Query keys
export const buildingQueryKeys = {
  all: ["buildings"] as const,
  lists: () => ["buildings", "list"] as const,
  list: (filters: Record<string, any>) =>
    ["buildings", "list", { filters }] as const,
  details: () => ["buildings", "detail"] as const,
  detail: (id: string) => ["buildings", "detail", id] as const,
  stats: () => ["buildings", "stats"] as const,
  buildingStats: (id: string) => ["buildings", "stats", id] as const,
};

// Get all buildings query hook
export function useBuildings(
  options?: UseQueryOptions<
    GetBuildingsResponse,
    AxiosError<BuildingErrorResponse>,
    BuildingWithOrganization[]
  >
) {
  return useQuery({
    queryKey: buildingQueryKeys.lists(),
    queryFn: () => buildingsApi.getAll(),
    select: (data) => data.data,
    ...options,
  });
}

// Get building by ID query hook
export function useBuilding(
  id: string,
  options?: UseQueryOptions<
    CreateBuildingResponse,
    AxiosError<BuildingErrorResponse>,
    BuildingWithOrganization
  >
) {
  return useQuery({
    queryKey: buildingQueryKeys.detail(id),
    queryFn: () => buildingsApi.getById(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - building details don't change frequently
    ...options,
  });
}

// Get building statistics query hook
export function useBuildingStats(
  id: string,
  options?: UseQueryOptions<
    GetBuildingStatsResponse,
    AxiosError<BuildingErrorResponse>,
    BuildingStatsResponse
  >
) {
  return useQuery({
    queryKey: buildingQueryKeys.buildingStats(id),
    queryFn: () => buildingsApi.getStats(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change more frequently
    ...options,
  });
}

// Create building mutation hook
export function useCreateBuilding(
  options?: UseMutationOptions<
    CreateBuildingResponse,
    AxiosError<BuildingErrorResponse>,
    CreateBuildingFormData
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};
  return useMutation({
    mutationFn: (data: CreateBuildingFormData) => buildingsApi.create(data),
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch buildings list
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() });

      // Invalidate organization stats (building count changes)
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.stats(),
      });

      // Add the new building to the cache
      queryClient.setQueryData(buildingQueryKeys.detail(data.data.id), data);
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Create building error:", getErrorMessage(error));
      onError?.(error, variables, context);
    },
    ...rest,
  });
}

// Update building mutation hook
export function useUpdateBuilding(
  options?: UseMutationOptions<
    CreateBuildingResponse,
    AxiosError<BuildingErrorResponse>,
    { id: string; data: Partial<CreateBuildingFormData> }
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: ({ id, data }) => buildingsApi.update(id, data),
    onSuccess: (data, variables, context) => {
      // Hook's cache invalidation logic (always runs)

      // 1. Invalidate buildings list queries
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() });

      // 2. Invalidate building detail queries
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.details(),
      });

      // 3. Invalidate building stats (data might have changed)
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.buildingStats(variables.id),
      });

      // 4. Update the building detail cache
      queryClient.setQueryData(buildingQueryKeys.detail(variables.id), data);

      // Call user-provided onSuccess callback if provided
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Hook's error handling (always runs)
      console.error("Update building error:", getErrorMessage(error));

      // Call user-provided onError callback if provided
      onError?.(error, variables, context);
    },
    // Spread other options (excluding onSuccess and onError which we handle above)
    ...rest,
  });
}

// Delete building mutation hook
export function useDeleteBuilding(
  options?: UseMutationOptions<
    { success: true; message: string },
    AxiosError<BuildingErrorResponse>,
    string
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: (id: string) => buildingsApi.delete(id),
    onSuccess: (data, variables, context) => {
      // Hook's cache invalidation logic (always runs)
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() });

      // Invalidate organization stats (building count decreases)
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.stats(),
      });

      // Remove building detail and stats from cache
      queryClient.removeQueries({
        queryKey: buildingQueryKeys.detail(variables),
      });
      queryClient.removeQueries({
        queryKey: buildingQueryKeys.buildingStats(variables),
      });

      // Call user-provided onSuccess callback if provided
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Hook's error handling (always runs)
      console.error("Delete building error:", getErrorMessage(error));

      // Call user-provided onError callback if provided
      onError?.(error, variables, context);
    },
    // Spread other options (excluding onSuccess and onError which we handle above)
    ...rest,
  });
}

// Helper function to check if error is validation error
export function isBuildingValidationError(
  error: AxiosError<BuildingErrorResponse>
): boolean {
  return error.response?.status === 400 && !!error.response?.data?.details;
}

// Helper function to get validation errors
export function getBuildingValidationErrors(
  error: AxiosError<BuildingErrorResponse>
): Record<string, string> {
  if (!isBuildingValidationError(error) || !error.response?.data?.details) {
    return {};
  }

  const errors: Record<string, string> = {};
  error.response.data.details.forEach((detail) => {
    errors[detail.field] = detail.message;
  });

  return errors;
}
