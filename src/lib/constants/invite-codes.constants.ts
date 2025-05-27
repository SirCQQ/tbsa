import type { InviteCodeStatus } from "@prisma/client";
import type { InviteCodeStatusConfig } from "@/types/invite-codes.types";

// Status configurations for UI display
export const INVITE_CODE_STATUS_CONFIG: Record<
  InviteCodeStatus,
  InviteCodeStatusConfig
> = {
  ACTIVE: {
    label: "Activ",
    variant: "default",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  USED: {
    label: "Folosit",
    variant: "success",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  EXPIRED: {
    label: "Expirat",
    variant: "destructive",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  CANCELLED: {
    label: "Anulat",
    variant: "secondary",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  },
};

// Error codes and their user-friendly messages
export const INVITE_CODE_ERROR_MESSAGES: Record<string, string> = {
  APARTMENT_NOT_FOUND: "Apartamentul nu a fost găsit sau nu aveți permisiuni",
  CODE_ALREADY_EXISTS: "Apartamentul are deja un cod de invitație activ",
  CODE_GENERATION_FAILED: "Nu s-a putut genera un cod unic",
  INVALID_CODE: "Codul de invitație nu este valid",
  CODE_NOT_ACTIVE: "Codul de invitație nu mai este activ",
  CODE_EXPIRED: "Codul de invitație a expirat",
  APARTMENT_ALREADY_OWNED: "Apartamentul are deja un proprietar",
  CODE_NOT_FOUND: "Codul de invitație nu a fost găsit",
  CODE_NOT_CANCELLABLE: "Codul de invitație nu poate fi anulat",
  VALIDATION_FAILED: "Datele de intrare sunt invalide",
  INTERNAL_ERROR: "Eroare internă de server",
};

// Default expiration time (30 days from now)
export const DEFAULT_EXPIRATION_DAYS = 30;

// Code generation settings
export const CODE_GENERATION_CONFIG = {
  LENGTH: 8,
  CHARACTERS: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  MAX_ATTEMPTS: 10,
} as const;
