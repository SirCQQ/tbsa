import type { DefaultSession } from "next-auth";

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
      permissions: PermissionString[];
      organizations: UserOrganizationWithDetails[];
      roles: RoleString[];
      currentOrganizationId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    firstName: string;
    lastName: string;
    isVerified?: boolean;
    permissions: PermissionString[];
    organizations?: UserOrganizationWithDetails[];
    roles?: RoleString[];
    currentOrganizationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    organizations: UserOrganizationWithDetails[];
    permissions: PermissionString[];
    roles: RoleString[];
    currentOrganizationId: string | null;
  }
}
