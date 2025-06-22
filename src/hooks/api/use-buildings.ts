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
  type BuildingErrorResponse,
  type BuildingWithOrganization,
} from "@/lib/api/buildings";
import { getErrorMessage } from "@/lib/axios";
import type { CreateBuildingFormData } from "@/lib/validations/building";
import type { AxiosError } from "axios";

// Query keys
export const buildingQueryKeys = {
  all: ["buildings"] as const,
  lists: () => [...buildingQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...buildingQueryKeys.lists(), { filters }] as const,
  details: () => [...buildingQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...buildingQueryKeys.details(), id] as const,
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

  return useMutation({
    mutationFn: (data: CreateBuildingFormData) => buildingsApi.create(data),
    onSuccess: (data) => {
      // Invalidate and refetch buildings list
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() });

      // Optionally add the new building to the cache
      queryClient.setQueryData(buildingQueryKeys.detail(data.data.id), data);
    },
    onError: (error) => {
      console.error("Create building error:", getErrorMessage(error));
    },
    ...options,
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

  return useMutation({
    mutationFn: ({ id, data }) => buildingsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch buildings list
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() });

      // Update the specific building in cache
      queryClient.setQueryData(buildingQueryKeys.detail(variables.id), data);
    },
    onError: (error) => {
      console.error("Update building error:", getErrorMessage(error));
    },
    ...options,
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

  return useMutation({
    mutationFn: (id: string) => buildingsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch buildings list
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() });

      // Remove the deleted building from cache
      queryClient.removeQueries({
        queryKey: buildingQueryKeys.detail(deletedId),
      });
    },
    onError: (error) => {
      console.error("Delete building error:", getErrorMessage(error));
    },
    ...options,
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
