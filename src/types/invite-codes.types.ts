import type { InviteCodeStatus } from "@prisma/client";

// Re-export the enum for easier imports
export { InviteCodeStatus } from "@prisma/client";

// Service response types
export type ServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
};

// Invite code with full details
export type InviteCodeWithDetails = {
  id: string;
  code: string;
  status: InviteCodeStatus;
  apartmentId: string;
  apartment: {
    id: string;
    number: string;
    floor: number | null;
    rooms: number | null;
    ownerId: string | null;
    building: {
      id: string;
      name: string;
      address: string;
    };
  };
  createdBy: string;
  usedBy: string | null;
  usedByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  usedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Input types for service methods
export type CreateInviteCodeInput = {
  apartmentId: string;
  expiresAt?: Date;
};

export type UseInviteCodeInput = {
  code: string;
  userId: string;
};

// Status badge types
export type InviteCodeStatusVariant =
  | "default"
  | "success"
  | "destructive"
  | "secondary";

export type InviteCodeStatusConfig = {
  label: string;
  variant: InviteCodeStatusVariant;
  className?: string;
};
