import type { Role, Permission } from "@prisma/client/wasm";

// Base Prisma types re-exported for convenience
export type { Permission, Role } from "@prisma/client/wasm";
import {
  PermissionResource,
  PermissionScope,
  PermissionAction,
} from "@prisma/client/wasm";

export type PermissionCheck = {
  resource: PermissionResource;
  action: PermissionAction;
  scope?: PermissionScope;
};

// User with role relation (matches select query)
export type UserWithRole = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
};

// User with role and profile relations (matches select query)
export type UserWithRoleAndProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  role: {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
  };
  administrator: {
    id: string;
  } | null;
  owner: {
    id: string;
    apartments: {
      id: string;
      number: string;
      building: {
        name: string;
      };
    }[];
  } | null;
};

// Role with permissions relation
export type RoleWithPermissions = Role & {
  permissions: Permission[];
};

// User permissions aggregate
export type UserPermissions = {
  userId: string;
  roleName: string;
  permissions: Permission[];
};
