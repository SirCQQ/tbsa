import { z } from "zod";

// Base user fields (without password confirmation validation)
const baseUserFields = z.object({
  firstName: z
    .string()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Numele nu poate depăși 50 de caractere")
    .regex(
      /^[a-zA-ZăâîșțĂÂÎȘȚ\s-]+$/,
      "Numele poate conține doar litere, spații și liniuțe"
    ),

  lastName: z
    .string()
    .min(2, "Prenumele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Prenumele nu poate depăși 50 de caractere")
    .regex(
      /^[a-zA-ZăâîșțĂÂÎȘȚ\s-]+$/,
      "Prenumele poate conține doar litere, spații și liniuțe"
    ),

  email: z
    .string()
    .email("Adresa de email nu este validă")
    .min(5, "Email-ul trebuie să aibă cel puțin 5 caractere")
    .max(100, "Email-ul nu poate depăși 100 de caractere")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Parola trebuie să aibă cel puțin 8 caractere")
    .max(100, "Parola nu poate depăși 100 de caractere")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Parola trebuie să conțină cel puțin o literă mică, o literă mare, o cifră și un caracter special"
    ),

  confirmPassword: z.string(),
});

// Organization registration schema
export const organizationRegistrationSchema = baseUserFields
  .extend({
    organizationName: z
      .string()
      .min(2, "Numele organizației trebuie să aibă cel puțin 2 caractere")
      .max(100, "Numele organizației nu poate depăși 100 de caractere"),

    organizationCode: z
      .string()
      .min(3, "Codul organizației trebuie să aibă cel puțin 3 caractere")
      .max(50, "Codul organizației nu poate depăși 50 de caractere")
      .regex(
        /^[a-zA-Z0-9-_]+$/,
        "Codul poate conține doar litere, cifre, liniuțe și underscore"
      )
      .toLowerCase(),

    organizationDescription: z
      .string()
      .max(500, "Descrierea nu poate depăși 500 de caractere")
      .optional(),

    phone: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val || /^(\+40|0040|0)[0-9]{9}$/.test(val.replace(/\s|-/g, "")),
        "Numărul de telefon trebuie să fie în format românesc valid (ex: +40123456789 sau 0123456789)"
      ),

    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "Trebuie să acceptați termenii și condițiile",
    }),

    subscriptionPlanId: z.string().optional(), // For future subscription selection
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu se potrivesc",
    path: ["confirmPassword"],
  });

// User registration with invite code schema
export const userRegistrationSchema = baseUserFields
  .extend({
    inviteCode: z
      .string()
      .min(1, "Codul de invitație este obligatoriu")
      .max(100, "Codul de invitație nu poate depăși 100 de caractere"),

    phone: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val || /^(\+40|0040|0)[0-9]{9}$/.test(val.replace(/\s|-/g, "")),
        "Numărul de telefon trebuie să fie în format românesc valid (ex: +40123456789 sau 0123456789)"
      ),

    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "Trebuie să acceptați termenii și condițiile",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu se potrivesc",
    path: ["confirmPassword"],
  });

// Sign in schema
export const signInSchema = z.object({
  email: z
    .string()
    .email("Adresa de email nu este validă")
    .min(1, "Email-ul este obligatoriu"),

  password: z.string().min(1, "Parola este obligatorie"),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .email("Adresa de email nu este validă")
    .min(1, "Email-ul este obligatoriu"),
});

// Password reset schema
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Token-ul este obligatoriu"),
    password: z
      .string()
      .min(8, "Parola trebuie să aibă cel puțin 8 caractere")
      .max(100, "Parola nu poate depăși 100 de caractere")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Parola trebuie să conțină cel puțin o literă mică, o literă mare, o cifră și un caracter special"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu se potrivesc",
    path: ["confirmPassword"],
  });

// Type exports
export type OrganizationRegistrationData = z.infer<
  typeof organizationRegistrationSchema
>;
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type PasswordResetRequestData = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;

// Note: formatPhoneNumber helper function is available in @/lib/validations/contact
