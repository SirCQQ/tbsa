import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type {
  ErrorApiResponse,
  ErrorServiceResult,
  SuccessApiResponse,
  SuccessServiceResult,
} from "@/types/api-response";
import { ZodError } from "zod";
import { Permission } from "@prisma/client";
import { getPermissionString } from "./auth-helpers";

export type Handler<T extends Response> = (
  request: NextRequest,
  session?: any,
  params?: Record<string, Promise<any>>
) => Promise<T> | T;

export function withAuth<T extends Response>(
  handler: Handler<T>,
  requiredPermissions: Pick<Permission, "resource" | "action">[],
  withOrgPermissions: boolean = false
) {
  return async function (
    request: NextRequest,
    queryParams?: Record<string, Promise<any>>
  ) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (requiredPermissions.length === 0) {
      return handler(request, session, queryParams);
    }

    // Check all required permissions
    const hasAllPermissions = requiredPermissions
      .map(getPermissionString)
      .some((perm) => (session.user.permissions || []).includes(perm));

    if (!hasAllPermissions) {
      return NextResponse.json(
        { error: "Insufficient permissions." },
        { status: 403 }
      );
    }
    // 3. Validate organization access
    if (withOrgPermissions) {
      if (!session.user.currentOrganizationId) {
        return NextResponse.json(
          { error: "No organization context found" },
          { status: 400 }
        );
      }
    }

    return handler(request, session, queryParams);
  };
}

export function errorServiceResultResponse<T>(
  result: ErrorServiceResult<T>,
  alternativeError?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: alternativeError ?? result.error,
      data: result.data,
    } as ErrorApiResponse,
    { status: result.statusCode ?? 500 }
  );
}

export function toSuccessApiResponse<T>(
  serviceResult: SuccessServiceResult<T>,
  status: number = 200
) {
  const apiResponse: SuccessApiResponse<T> = {
    success: true,
    data: serviceResult.data,
  };
  return NextResponse.json(apiResponse, { status });
}

export function zodErrorToNextResponse(error: ZodError) {
  const apiError: ErrorApiResponse = {
    success: false,
    error: "Validation error",
    details: error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  };
  return NextResponse.json(apiError, { status: 400 });
}

export function internalServerErrorResponse() {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
