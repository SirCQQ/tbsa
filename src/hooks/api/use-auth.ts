import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  authApi,
  type OrganizationRegistrationResponse,
  type AuthErrorResponse,
} from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/axios";
import type {
  OrganizationRegistrationData,
  UserRegistrationData,
} from "@/lib/validations/auth";
import type { AxiosError } from "axios";

// Organization registration mutation hook
export function useRegisterOrganization(
  options?: UseMutationOptions<
    OrganizationRegistrationResponse,
    AxiosError<AuthErrorResponse>,
    OrganizationRegistrationData
  >
) {
  return useMutation({
    mutationFn: (data: OrganizationRegistrationData) =>
      authApi.registerOrganization(data),
    onError: (error) => {
      console.error("Organization registration error:", getErrorMessage(error));
    },
    ...options,
  });
}

// User registration mutation hook
export function useRegisterUser(
  options?: UseMutationOptions<
    any, // UserRegistrationResponse type would go here
    AxiosError<AuthErrorResponse>,
    UserRegistrationData
  >
) {
  return useMutation({
    mutationFn: (data: UserRegistrationData) => authApi.registerUser(data),
    onError: (error) => {
      console.error("User registration error:", getErrorMessage(error));
    },
    ...options,
  });
}

// Helper function to check if error is validation error
export function isValidationError(
  error: AxiosError<AuthErrorResponse>
): boolean {
  return error.response?.status === 400 && !!error.response?.data?.details;
}

// Helper function to get validation errors
export function getValidationErrors(
  error: AxiosError<AuthErrorResponse>
): Record<string, string> {
  if (!isValidationError(error) || !error.response?.data?.details) {
    return {};
  }

  const errors: Record<string, string> = {};
  error.response.data.details.forEach((detail) => {
    errors[detail.field] = detail.message;
  });

  return errors;
}
