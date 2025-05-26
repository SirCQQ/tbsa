import { z } from "zod";

// User validation schemas
export const UserSchema = z.object({
  email: z.string().email("Adresa de email nu este validă"),
  password: z
    .string()
    .min(1, "Parola este obligatorie")
    .min(6, "Parola trebuie să aibă cel puțin 6 caractere")
    .refine((password) => password.trim().length > 0, {
      message: "Parola nu poate fi goală sau să conțină doar spații",
    }),
  firstName: z.string().min(1, "Prenumele este obligatoriu"),
  lastName: z.string().min(1, "Numele este obligatoriu"),
  phone: z.string().optional(),
  role: z.enum(["ADMINISTRATOR", "OWNER"]),
});

export const LoginSchema = z.object({
  email: z.string().email("Adresa de email nu este validă"),
  password: z
    .string()
    .min(1, "Parola este obligatorie")
    .refine((password) => password.trim().length > 0, {
      message: "Parola nu poate fi goală sau să conțină doar spații",
    }),
});

export const RegisterSchema = UserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolele nu se potrivesc",
  path: ["confirmPassword"],
});

// Update schemas (for partial updates)
export const UpdateUserSchema = UserSchema.omit({ password: true }).partial();

// Type exports
export type UserData = z.infer<typeof UserSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
