export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: unknown[];
  code?: string;
};

export type ApiError = {
  message: string;
  status: number;
  code?: string;
};

// Enum for authentication error codes
export enum AuthErrorCode {
  MISSING_TOKEN = "AUTH_001",
  INVALID_TOKEN = "AUTH_002",
  EXPIRED_TOKEN = "AUTH_003",
  INSUFFICIENT_PERMISSIONS = "AUTH_004",
  INVALID_CREDENTIALS = "AUTH_005",
  USER_NOT_FOUND = "AUTH_006",
  VALIDATION_FAILED = "AUTH_007",
  TENANT_ACCESS_DENIED = "AUTH_008",
  RATE_LIMIT_EXCEEDED = "AUTH_009",
  INTERNAL_ERROR = "AUTH_010",
}

// Enum for authentication error keys (for function parameters)
export enum AuthErrorKey {
  MISSING_TOKEN = "MISSING_TOKEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  EXPIRED_TOKEN = "EXPIRED_TOKEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  TENANT_ACCESS_DENIED = "TENANT_ACCESS_DENIED",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// Service error codes
export enum ServiceErrorCode {
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

// Helper functions for creating service responses
export function createServiceSuccess<T>(
  data: T,
  message = "Success"
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function createServiceError<T = never>(
  code: keyof typeof ServiceErrorCode,
  message: string,
  details?: unknown[]
): ApiResponse<T> {
  return {
    success: false,
    message,
    error: message,
    code: ServiceErrorCode[code],
    details,
  };
}

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
