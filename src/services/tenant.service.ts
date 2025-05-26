import { NextRequest } from "next/server";

export type TenantContext = {
  userId: string;
  role: "ADMINISTRATOR" | "OWNER";
  administratorId?: string;
  ownerId?: string;
  email: string;
};

/**
 * Multi-tenant service for access control and data isolation
 */
export class TenantService {
  /**
   * Extract tenant context from request headers (set by middleware)
   */
  static getTenantContext(request: NextRequest): TenantContext | null {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role") as
      | "ADMINISTRATOR"
      | "OWNER";
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
}
