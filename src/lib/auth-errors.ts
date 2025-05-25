import { NextResponse } from "next/server";
import { AuthErrorCode, AuthErrorKey, type ApiResponse } from "@/types/api";

export type AuthErrorDetails = {
  code: AuthErrorCode;
  message: string;
  status: number;
  shouldClearToken?: boolean;
  logLevel?: "error" | "warn" | "info";
};

// Predefined authentication errors using enums
export const AUTH_ERRORS: Record<AuthErrorKey, AuthErrorDetails> = {
  [AuthErrorKey.MISSING_TOKEN]: {
    code: AuthErrorCode.MISSING_TOKEN,
    message: "Authentication required",
    status: 401,
    logLevel: "info",
  },
  [AuthErrorKey.INVALID_TOKEN]: {
    code: AuthErrorCode.INVALID_TOKEN,
    message: "Invalid authentication token",
    status: 401,
    shouldClearToken: true,
    logLevel: "warn",
  },
  [AuthErrorKey.EXPIRED_TOKEN]: {
    code: AuthErrorCode.EXPIRED_TOKEN,
    message: "Authentication token has expired",
    status: 401,
    shouldClearToken: true,
    logLevel: "info",
  },
  [AuthErrorKey.INSUFFICIENT_PERMISSIONS]: {
    code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
    message: "Insufficient permissions",
    status: 403,
    logLevel: "warn",
  },
  [AuthErrorKey.INVALID_CREDENTIALS]: {
    code: AuthErrorCode.INVALID_CREDENTIALS,
    message: "Invalid email or password",
    status: 401,
    logLevel: "info",
  },
  [AuthErrorKey.USER_NOT_FOUND]: {
    code: AuthErrorCode.USER_NOT_FOUND,
    message: "User not found",
    status: 404,
    logLevel: "warn",
  },
  [AuthErrorKey.VALIDATION_FAILED]: {
    code: AuthErrorCode.VALIDATION_FAILED,
    message: "Validation failed",
    status: 400,
    logLevel: "info",
  },
  [AuthErrorKey.TENANT_ACCESS_DENIED]: {
    code: AuthErrorCode.TENANT_ACCESS_DENIED,
    message: "Access denied to tenant resources",
    status: 403,
    logLevel: "warn",
  },
  [AuthErrorKey.RATE_LIMIT_EXCEEDED]: {
    code: AuthErrorCode.RATE_LIMIT_EXCEEDED,
    message: "Too many authentication attempts",
    status: 429,
    logLevel: "warn",
  },
  [AuthErrorKey.INTERNAL_ERROR]: {
    code: AuthErrorCode.INTERNAL_ERROR,
    message: "Internal server error",
    status: 500,
    logLevel: "error",
  },
};

/**
 * Create a standardized authentication error response
 */
export function createAuthError(
  errorKey: AuthErrorKey,
  customMessage?: string,
  details?: unknown[]
): NextResponse {
  const error = AUTH_ERRORS[errorKey];

  // Log the error with appropriate level
  const logMessage = `Auth Error [${error.code}]: ${
    customMessage || error.message
  }`;
  switch (error.logLevel) {
    case "error":
      console.error(logMessage);
      break;
    case "warn":
      console.warn(logMessage);
      break;
    case "info":
    default:
      console.info(logMessage);
      break;
  }

  const response = NextResponse.json(
    {
      error: customMessage || error.message,
      code: error.code,
      details,
    },
    { status: error.status }
  );

  // Clear token if required
  if (error.shouldClearToken) {
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });
  }

  return response;
}

/**
 * Create a standardized service error response
 */
export function createServiceError<T = unknown>(
  errorKey: AuthErrorKey,
  customMessage?: string,
  details?: unknown[]
): ApiResponse<T> {
  const error = AUTH_ERRORS[errorKey];

  // Log the error
  const logMessage = `Service Error [${error.code}]: ${
    customMessage || error.message
  }`;
  switch (error.logLevel) {
    case "error":
      console.error(logMessage);
      break;
    case "warn":
      console.warn(logMessage);
      break;
    case "info":
    default:
      console.info(logMessage);
      break;
  }

  return {
    success: false,
    message: "Authentication failed",
    error: customMessage || error.message,
    code: error.code,
    details,
  };
}

/**
 * Determine error type from JWT verification error
 */
export function getJWTErrorType(error: unknown): AuthErrorKey {
  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  if (errorMessage.includes("expired") || errorMessage.includes("exp")) {
    return AuthErrorKey.EXPIRED_TOKEN;
  }

  if (errorMessage.includes("invalid") || errorMessage.includes("malformed")) {
    return AuthErrorKey.INVALID_TOKEN;
  }

  // Default to invalid token for any JWT error
  return AuthErrorKey.INVALID_TOKEN;
}

/**
 * Audit log for authentication events
 */
export function auditAuthEvent(
  event:
    | "login_success"
    | "login_failed"
    | "token_invalid"
    | "permission_denied",
  userId?: string,
  email?: string,
  ip?: string,
  userAgent?: string,
  details?: Record<string, unknown>
): void {
  const auditLog = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    email,
    ip,
    userAgent,
    details,
  };

  // In production, this should be sent to a proper audit logging service
  console.info("AUTH_AUDIT:", JSON.stringify(auditLog));
}
