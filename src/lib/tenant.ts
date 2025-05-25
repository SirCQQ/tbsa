import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { JWTPayload } from "@/types/auth";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

export type TenantContext = {
  userId: string;
  role: "ADMINISTRATOR" | "OWNER";
  administratorId?: string;
  ownerId?: string;
  email: string;
};

/**
 * Extract tenant context from request headers (set by middleware)
 */
export function getTenantContext(request: NextRequest): TenantContext | null {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role") as "ADMINISTRATOR" | "OWNER";
  const administratorId = request.headers.get("x-administrator-id");
  const ownerId = request.headers.get("x-owner-id");
  const email = request.headers.get("x-user-email");

  if (!userId || !role || !email) {
    return null;
  }

  return {
    userId,
    role,
    administratorId: administratorId || undefined,
    ownerId: ownerId || undefined,
    email,
  };
}

/**
 * Extract tenant context from JWT token directly
 */
export async function getTenantContextFromToken(
  token: string
): Promise<TenantContext | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const jwtPayload = payload as JWTPayload;

    return {
      userId: jwtPayload.userId,
      role: jwtPayload.role,
      administratorId: jwtPayload.administratorId,
      ownerId: jwtPayload.ownerId,
      email: jwtPayload.email,
    };
  } catch (error) {
    console.error("Failed to extract tenant context from token:", error);
    return null;
  }
}

/**
 * Create database filter for administrator tenant isolation
 */
export function createAdministratorFilter(administratorId: string) {
  return {
    administratorId,
  };
}

/**
 * Create database filter for owner tenant isolation
 */
export function createOwnerFilter(ownerId: string) {
  return {
    ownerId,
  };
}

/**
 * Create database filter for building access based on tenant context
 */
export function createBuildingFilter(context: TenantContext) {
  if (context.role === "ADMINISTRATOR" && context.administratorId) {
    return createAdministratorFilter(context.administratorId);
  }

  // Owners don't directly access buildings, they access through apartments
  throw new Error("Owners cannot directly access buildings");
}

/**
 * Create database filter for apartment access based on tenant context
 */
export function createApartmentFilter(context: TenantContext) {
  if (context.role === "ADMINISTRATOR" && context.administratorId) {
    // Administrators can access apartments in their buildings
    return {
      building: {
        administratorId: context.administratorId,
      },
    };
  }

  if (context.role === "OWNER" && context.ownerId) {
    // Owners can only access their own apartments
    return createOwnerFilter(context.ownerId);
  }

  throw new Error("Invalid tenant context for apartment access");
}

/**
 * Create database filter for water readings based on tenant context
 */
export function createWaterReadingFilter(context: TenantContext) {
  if (context.role === "ADMINISTRATOR" && context.administratorId) {
    // Administrators can access readings for apartments in their buildings
    return {
      apartment: {
        building: {
          administratorId: context.administratorId,
        },
      },
    };
  }

  if (context.role === "OWNER" && context.ownerId) {
    // Owners can only access readings for their apartments
    return {
      apartment: {
        ownerId: context.ownerId,
      },
    };
  }

  throw new Error("Invalid tenant context for water reading access");
}

/**
 * Validate if a user can access a specific building
 */
export function canAccessBuilding(
  context: TenantContext,
  buildingAdministratorId: string
): boolean {
  return (
    context.role === "ADMINISTRATOR" &&
    context.administratorId === buildingAdministratorId
  );
}

/**
 * Validate if a user can access a specific apartment
 */
export function canAccessApartment(
  context: TenantContext,
  apartment: { ownerId?: string | null; building: { administratorId: string } }
): boolean {
  if (context.role === "ADMINISTRATOR" && context.administratorId) {
    return context.administratorId === apartment.building.administratorId;
  }

  if (context.role === "OWNER" && context.ownerId) {
    return context.ownerId === apartment.ownerId;
  }

  return false;
}
