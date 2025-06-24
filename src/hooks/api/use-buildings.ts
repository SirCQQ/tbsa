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
  type GetBuildingWithApartmentsResponse,
  type BuildingErrorResponse,
  type BuildingWithOrganization,
  type BuildingWithApartments,
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

// Get building by ID query hook (simple version)
export function useBuilding(
  id: string,
  options?: UseQueryOptions<
    CreateBuildingResponse,
    AxiosError<BuildingErrorResponse>,
    BuildingWithOrganization
  >
): ReturnType<
  typeof useQuery<
    CreateBuildingResponse,
    AxiosError<BuildingErrorResponse>,
    BuildingWithOrganization
  >
>;

// Get building by ID query hook (with apartments version)
export function useBuilding(
  id: string,
  organizationId: string,
  options?: UseQueryOptions<
    GetBuildingWithApartmentsResponse,
    AxiosError<BuildingErrorResponse>,
    BuildingWithApartments
  >
): ReturnType<
  typeof useQuery<
    GetBuildingWithApartmentsResponse,
    AxiosError<BuildingErrorResponse>,
    BuildingWithApartments
  >
>;

// Implementation
export function useBuilding(
  id: string,
  organizationIdOrOptions?:
    | string
    | UseQueryOptions<any, AxiosError<BuildingErrorResponse>, any>,
  options?: UseQueryOptions<any, AxiosError<BuildingErrorResponse>, any>
) {
  // If second parameter is a string, it's organizationId (enriched version)
  const isEnrichedVersion = typeof organizationIdOrOptions === "string";
  const organizationId = isEnrichedVersion
    ? organizationIdOrOptions
    : undefined;
  const queryOptions = isEnrichedVersion ? options : organizationIdOrOptions;

  return useQuery({
    queryKey: isEnrichedVersion
      ? ["buildings", id, organizationId]
      : buildingQueryKeys.detail(id),
    queryFn: () => buildingsApi.getById(id),
    select: (data) => data.data,
    enabled: !!id && (!isEnrichedVersion || !!organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...queryOptions,
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

      // Optionally add the new building to the cache
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

      // 2. Invalidate all building detail queries (both standard and enriched patterns)
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.details(),
      });

      // 3. Invalidate enriched building queries (with organizationId)
      queryClient.invalidateQueries({
        queryKey: ["buildings", variables.id],
      });

      // 4. Update the standard building detail cache
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
      queryClient.removeQueries({
        queryKey: buildingQueryKeys.detail(variables),
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
