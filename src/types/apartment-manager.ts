// Apartment Manager types

export type ApartmentRole =
  | "OWNER" // Proprietar principal
  | "CO_OWNER" // Coproprietar
  | "TENANT" // Chiriaș
  | "MANAGER" // Manager (ex: administrator de bloc)
  | "FAMILY"; // Membru al familiei

export type ApartmentPermission =
  | "read" // Poate vedea informațiile apartamentului
  | "update" // Poate modifica informațiile apartamentului
  | "water_readings" // Poate adăuga/modifica citiri apă
  | "invite_others" // Poate invita alți manageri
  | "remove_others" // Poate elimina alți manageri
  | "view_history"; // Poate vedea istoricul modificărilor

// Default permissions for each role
export const DEFAULT_APARTMENT_PERMISSIONS: Record<
  ApartmentRole,
  ApartmentPermission[]
> = {
  OWNER: [
    "read",
    "update",
    "water_readings",
    "invite_others",
    "remove_others",
    "view_history",
  ],
  CO_OWNER: [
    "read",
    "update",
    "water_readings",
    "invite_others",
    "view_history",
  ],
  TENANT: ["read", "water_readings", "view_history"],
  MANAGER: ["read", "water_readings", "view_history"],
  FAMILY: ["read", "water_readings"],
};

// Role hierarchy for permission checking
export const APARTMENT_ROLE_HIERARCHY: Record<ApartmentRole, number> = {
  OWNER: 5,
  CO_OWNER: 4,
  TENANT: 3,
  MANAGER: 2,
  FAMILY: 1,
};

export interface ApartmentManagerData {
  id: string;
  apartmentId: string;
  userId: string;
  role: ApartmentRole;
  permissions: ApartmentPermission[];
  isPrimary: boolean;
  addedBy?: string;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };

  apartment?: {
    id: string;
    number: string;
    floor?: number;
    building: {
      id: string;
      name: string;
      address: string;
    };
  };
}

export interface CreateApartmentManagerInput {
  apartmentId: string;
  userId: string;
  role: ApartmentRole;
  permissions?: ApartmentPermission[]; // If not provided, use defaults for role
  isPrimary?: boolean;
}

export interface UpdateApartmentManagerInput {
  role?: ApartmentRole;
  permissions?: ApartmentPermission[];
  isPrimary?: boolean;
}

export interface ApartmentManagerQuery {
  apartmentId?: string;
  userId?: string;
  role?: ApartmentRole;
  isPrimary?: boolean;
}

// Helper functions
export function hasApartmentPermission(
  manager: ApartmentManagerData,
  permission: ApartmentPermission
): boolean {
  return manager.permissions.includes(permission);
}

export function canManageOther(
  manager: ApartmentManagerData,
  other: ApartmentManagerData
): boolean {
  // Primary owner can manage anyone
  if (manager.isPrimary && manager.role === "OWNER") {
    return true;
  }

  // Can't manage someone with higher or equal hierarchy
  const managerLevel = APARTMENT_ROLE_HIERARCHY[manager.role];
  const otherLevel = APARTMENT_ROLE_HIERARCHY[other.role];

  return (
    managerLevel > otherLevel &&
    hasApartmentPermission(manager, "remove_others")
  );
}

export function getDisplayName(role: ApartmentRole): string {
  const names: Record<ApartmentRole, string> = {
    OWNER: "Proprietar",
    CO_OWNER: "Coproprietar",
    TENANT: "Chiriaș",
    MANAGER: "Manager",
    FAMILY: "Familie",
  };

  return names[role];
}
