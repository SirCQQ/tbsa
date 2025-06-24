import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  apartmentsApi,
  type CreateApartmentResponse,
  type GetApartmentsResponse,
  type ApartmentErrorResponse,
  type ApartmentResponse,
  type BulkCreationResponse,
} from "@/lib/api/apartments";
import { getErrorMessage } from "@/lib/axios";
import type {
  CreateApartmentFormData,
  CreateBulkApartmentsFormData,
} from "@/lib/validations/apartment";
import type { AxiosError } from "axios";
import { buildingQueryKeys } from "./use-buildings";

// Query keys
export const apartmentQueryKeys = {
  all: ["apartments"] as const,
  lists: () => [...apartmentQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...apartmentQueryKeys.lists(), { filters }] as const,
  byBuilding: (buildingId: string) =>
    [...apartmentQueryKeys.lists(), { buildingId }] as const,
  details: () => [...apartmentQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...apartmentQueryKeys.details(), id] as const,
};

// Get apartments by building query hook
export function useApartmentsByBuilding(
  buildingId: string,
  options?: UseQueryOptions<
    GetApartmentsResponse,
    AxiosError<ApartmentErrorResponse>,
    ApartmentResponse[]
  >
) {
  return useQuery({
    queryKey: apartmentQueryKeys.byBuilding(buildingId),
    queryFn: () => apartmentsApi.getByBuilding(buildingId),
    select: (data) => data.data,
    enabled: !!buildingId,
    ...options,
  });
}

// Get apartment by ID query hook
export function useApartment(
  id: string,
  options?: UseQueryOptions<
    CreateApartmentResponse,
    AxiosError<ApartmentErrorResponse>,
    ApartmentResponse
  >
) {
  return useQuery({
    queryKey: apartmentQueryKeys.detail(id),
    queryFn: () => apartmentsApi.getById(id),
    select: (data) => data.data,
    enabled: !!id,
    ...options,
  });
}

// Create apartment mutation hook
export function useCreateApartment(
  options?: UseMutationOptions<
    CreateApartmentResponse,
    AxiosError<ApartmentErrorResponse>,
    CreateApartmentFormData
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};
  return useMutation({
    mutationFn: (data: CreateApartmentFormData) => apartmentsApi.create(data),
    onSuccess: (data, variables, context) => {
      // Invalidate apartments list for the specific building
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.byBuilding(variables.buildingId),
      });

      // Invalidate all apartment lists (including organization-wide lists)
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.lists(),
      });

      // Invalidate the specific building detail (apartment count may have changed)
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.detail(variables.buildingId),
      });

      // Invalidate building lists
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.all,
      });

      // Invalidate any generic apartment queries
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.all,
      });

      // Add the new apartment to the cache
      queryClient.setQueryData(apartmentQueryKeys.detail(data.data.id), data);

      // Call user-provided onSuccess callback if provided
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Create apartment error:", getErrorMessage(error));

      // Call user-provided onError callback if provided
      onError?.(error, variables, context);
    },
    // Spread other options but exclude onSuccess and onError to avoid overriding
    ...rest,
  });
}

// Update apartment mutation hook
export function useUpdateApartment(
  options?: UseMutationOptions<
    CreateApartmentResponse,
    AxiosError<ApartmentErrorResponse>,
    { id: string; data: Partial<CreateApartmentFormData> }
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: ({ id, data }) => apartmentsApi.update(id, data),
    onSuccess: (data, variables, context) => {
      // Invalidate apartments list for the building
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.byBuilding(data.data.buildingId),
      });

      // Invalidate all apartment lists
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.lists(),
      });

      // Invalidate the specific building detail (apartment info may have changed)
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.detail(data.data.buildingId),
      });

      // Invalidate building lists
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.all,
      });

      // Update the specific apartment in cache
      queryClient.setQueryData(apartmentQueryKeys.detail(variables.id), data);

      // Call user-provided onSuccess callback if provided
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Update apartment error:", getErrorMessage(error));

      // Call user-provided onError callback if provided
      onError?.(error, variables, context);
    },
    // Spread other options (excluding onSuccess and onError which we handle above)
    ...rest,
  });
}

// Delete apartment mutation hook
export function useDeleteApartment(
  options?: UseMutationOptions<
    { success: true; message: string },
    AxiosError<ApartmentErrorResponse>,
    { id: string; buildingId: string }
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: ({ id }) => apartmentsApi.delete(id),
    onSuccess: (result, variables, context) => {
      // Invalidate apartments list for the building
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.byBuilding(variables.buildingId),
      });

      // Invalidate all apartment lists
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.lists(),
      });

      // Invalidate the specific building detail (apartment count decreased)
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.detail(variables.buildingId),
      });

      // Invalidate building lists
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.all,
      });

      // Remove the deleted apartment from cache
      queryClient.removeQueries({
        queryKey: apartmentQueryKeys.detail(variables.id),
      });

      // Call user-provided onSuccess callback if provided
      onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Delete apartment error:", getErrorMessage(error));

      // Call user-provided onError callback if provided
      onError?.(error, variables, context);
    },
    // Spread other options (excluding onSuccess and onError which we handle above)
    ...rest,
  });
}

// Helper function to check if error is validation error
export function isApartmentValidationError(
  error: AxiosError<ApartmentErrorResponse>
): boolean {
  return error.response?.status === 400 && !!error.response?.data?.details;
}

// Helper function to get validation errors
export function getApartmentValidationErrors(
  error: AxiosError<ApartmentErrorResponse>
): Record<string, string> {
  if (!isApartmentValidationError(error) || !error.response?.data?.details) {
    return {};
  }

  const errors: Record<string, string> = {};
  error.response.data.details.forEach((detail) => {
    errors[detail.field] = detail.message;
  });

  return errors;
}

// Bulk create apartments mutation hook
export function useCreateBulkApartments(
  options?: UseMutationOptions<
    BulkCreationResponse,
    AxiosError<ApartmentErrorResponse>,
    CreateBulkApartmentsFormData
  >
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: (data: CreateBulkApartmentsFormData) =>
      apartmentsApi.createBulk(data),
    onSuccess: (response, variables, context) => {
      // Invalidate apartments list for the specific building
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.byBuilding(variables.buildingId),
      });

      // Invalidate all apartment lists (including organization-wide lists)
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.lists(),
      });

      // Invalidate the specific building detail (apartment count may have changed)
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.detail(variables.buildingId),
      });

      // Invalidate building lists
      queryClient.invalidateQueries({
        queryKey: buildingQueryKeys.all,
      });

      // Invalidate any generic apartment queries
      queryClient.invalidateQueries({
        queryKey: apartmentQueryKeys.all,
      });

      // Add all newly created apartments to the cache
      response.data.created.forEach((apartment) => {
        queryClient.setQueryData(apartmentQueryKeys.detail(apartment.id), {
          success: true,
          message: "Apartment retrieved successfully",
          data: apartment,
        } as CreateApartmentResponse);
      });

      // Call user-provided onSuccess callback if provided
      onSuccess?.(response, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Bulk create apartments error:", getErrorMessage(error));

      // Call user-provided onError callback if provided
      onError?.(error, variables, context);
    },
    // Spread other options but exclude onSuccess and onError to avoid overriding
    ...rest,
  });
}
