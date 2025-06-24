import type { DefaultSession } from "next-auth";

// Simplified types - store only codes/IDs instead of full objects
export type PermissionCode = string; // e.g., "users:read",   `${ResourcesEnum.BUILDINGS}:${ActionsEnum.CREATE}`
export type RoleCode = string; // e.g., "ADMIN", "OWNER", "TENANT"
export type OrganizationReference = {
  id: string;
  code: string;
  name: string; // Keep name for display purposes
};

// Keep full types for when we need to fetch complete data
export type PermissionString = {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
  description?: string | null;
};

export type RoleString = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

export type UserOrganizationWithDetails = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
      permissions: PermissionCode[]; // Simplified: just codes
      organizations: OrganizationReference[]; // Simplified: minimal data
      roles: RoleCode[]; // Simplified: just codes
      currentOrganizationId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    firstName: string;
    lastName: string;
    isVerified?: boolean;
    permissions: PermissionCode[]; // Simplified: just codes
    organizations?: OrganizationReference[]; // Simplified: minimal data
    roles?: RoleCode[]; // Simplified: just codes
    currentOrganizationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    organizations: OrganizationReference[]; // Simplified: minimal data
    permissions: PermissionCode[]; // Simplified: just codes
    roles: RoleCode[]; // Simplified: just codes
    currentOrganizationId: string | null;
  }
}
