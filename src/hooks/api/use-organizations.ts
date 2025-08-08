import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  organizationsApi,
  UserOrganizationResponse,
  OrganizationDetailResponse,
  OrganizationStatsResponse,
} from "@/lib/api/organizations";
import { SuccessApiResponse } from "@/types/api-response";
import type { AxiosError } from "axios";

// Query keys
export const organizationQueryKeys = {
  all: ["organizations"] as const,
  lists: () => ["organizations", "list"] as const,
  userOrganizations: () => ["organizations", "list", "user"] as const,
  details: () => ["organizations", "detail"] as const,
  detail: (orgId: string) => ["organizations", "detail", orgId] as const,
  stats: () => ["organizations", "stats"] as const,
  orgStats: (orgId: string) => ["organizations", "stats", orgId] as const,
};

// Get user organizations query hook
export function useUserOrganizations(
  options?: UseQueryOptions<
    SuccessApiResponse<UserOrganizationResponse[]>,
    AxiosError<{ error: string; details?: any[] }>,
    UserOrganizationResponse[]
  >
) {
  return useQuery({
    queryKey: organizationQueryKeys.userOrganizations(),
    queryFn: () => organizationsApi.getUserOrganizations(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes - organizations don't change frequently
    ...options,
  });
}

// Get organization by ID query hook
export function useOrganization(
  orgId: string,
  options?: UseQueryOptions<
    SuccessApiResponse<OrganizationDetailResponse>,
    AxiosError<{ error: string; details?: any[] }>,
    OrganizationDetailResponse
  >
) {
  return useQuery({
    queryKey: organizationQueryKeys.detail(orgId),
    queryFn: () => organizationsApi.getById(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes - organization details don't change frequently
    ...options,
  });
}

// Get organization statistics query hook
export function useOrganizationStats(
  orgId: string,
  options?: UseQueryOptions<
    SuccessApiResponse<OrganizationStatsResponse>,
    AxiosError<{ error: string; details?: any[] }>,
    OrganizationStatsResponse
  >
) {
  return useQuery({
    queryKey: [...organizationQueryKeys.all, "stats", orgId],
    queryFn: () => organizationsApi.getStats(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change more frequently
    ...options,
  });
}

// Helper function to check if error is validation error
export function isOrganizationValidationError(
  error: AxiosError<{
    error: string;
    details?: Array<{ field: string; message: string }>;
  }>
): boolean {
  return error.response?.status === 400 && !!error.response?.data?.details;
}

// Helper function to get validation errors
export function getOrganizationValidationErrors(
  error: AxiosError<{
    error: string;
    details?: Array<{ field: string; message: string }>;
  }>
): Record<string, string> {
  if (!isOrganizationValidationError(error) || !error.response?.data?.details) {
    return {};
  }

  const errors: Record<string, string> = {};
  error.response.data.details.forEach(
    (detail: { field: string; message: string }) => {
      errors[detail.field] = detail.message;
    }
  );

  return errors;
}
