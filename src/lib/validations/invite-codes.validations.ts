import { z } from "zod";

// Validation schema for creating invite codes (API)
export const CreateInviteCodeSchema = z.object({
  apartmentId: z.string().min(1, "ID-ul apartamentului este obligatoriu"),
  expiresAt: z.date().optional(),
});

// Validation schema for create invite code form (UI)
export const CreateInviteCodeFormSchema = z.object({
  apartmentId: z.string().min(1, "Selectează un apartament"),
  expiresAt: z.string().optional(),
});

// Validation schema for using invite codes
export const UseInviteCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Codul trebuie să aibă cel puțin 6 caractere")
    .max(8, "Codul trebuie să aibă cel mult 8 caractere")
    .regex(/^[A-Z0-9]+$/, "Codul poate conține doar litere mari și cifre"),
  userId: z.string().min(1, "ID-ul utilizatorului este obligatoriu"),
});

// Validation schema for cancelling invite codes
export const CancelInviteCodeSchema = z.object({
  codeId: z.string().min(1, "ID-ul codului este obligatoriu"),
  administratorId: z
    .string()
    .min(1, "ID-ul administratorului este obligatoriu"),
});

// Type inference from schemas
export type CreateInviteCodeInput = z.infer<typeof CreateInviteCodeSchema>;
export type CreateInviteCodeFormInput = z.infer<
  typeof CreateInviteCodeFormSchema
>;
export type UseInviteCodeInput = z.infer<typeof UseInviteCodeSchema>;
export type CancelInviteCodeInput = z.infer<typeof CancelInviteCodeSchema>;
