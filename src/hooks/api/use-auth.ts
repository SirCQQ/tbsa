import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  authApi,
  type OrganizationRegistrationResponse,
  type UserRegistrationResponse,
  type EmailVerificationResponse,
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
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: (data: OrganizationRegistrationData) =>
      authApi.registerOrganization(data),
    onSuccess: (data, variables, context) => {
      // Hook's success logic (always runs)
      // No cache invalidation needed for registration

      // Call user-provided onSuccess callback if provided
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Hook's error handling (always runs)
      console.error("Organization registration error:", getErrorMessage(error));

      // Call user-provided onError callback if provided
      onError?.(error, variables, context);
    },
    // Spread other options (excluding onSuccess and onError which we handle above)
    ...rest,
  });
}

// User registration mutation hook
export function useRegisterUser(
  options?: UseMutationOptions<
    UserRegistrationResponse,
    AxiosError<AuthErrorResponse>,
    UserRegistrationData
  >
) {
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation({
    mutationFn: (data: UserRegistrationData) => authApi.registerUser(data),
    onSuccess: (data, variables, context) => {
      // Hook's success logic (always runs)
      // No cache invalidation needed for registration

      // Call user-provided onSuccess callback if provided
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Hook's error handling (always runs)
      console.error("User registration error:", getErrorMessage(error));

      // Call user-provided onError callback if provided
      onError?.(error, variables, context);
    },
    // Spread other options (excluding onSuccess and onError which we handle above)
    ...rest,
  });
}

// Email verification mutation hook
export function useVerifyEmail(
  options?: UseMutationOptions<
    EmailVerificationResponse,
    AxiosError<AuthErrorResponse>,
    string
  >
) {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onError: (error) => {
      console.error("Email verification error:", getErrorMessage(error));
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
