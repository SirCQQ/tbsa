import { z } from "zod";

export const contactFormSchema = z.object({
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

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+40|0040|0)[0-9]{9}$/.test(val.replace(/\s|-/g, "")),
      "Numărul de telefon trebuie să fie în format românesc valid (ex: +40123456789 sau 0123456789)"
    ),

  subject: z
    .string()
    .min(5, "Subiectul trebuie să aibă cel puțin 5 caractere")
    .max(100, "Subiectul nu poate depăși 100 de caractere")
    .trim(),

  message: z
    .string()
    .min(20, "Mesajul trebuie să aibă cel puțin 20 de caractere")
    .max(1000, "Mesajul nu poate depăși 1000 de caractere")
    .trim(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Helper function to format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s|-/g, "");
  if (cleaned.startsWith("+40")) {
    return cleaned;
  }
  if (cleaned.startsWith("0040")) {
    return cleaned.replace("0040", "+40");
  }
  if (cleaned.startsWith("0")) {
    return "+40" + cleaned.substring(1);
  }
  return phone;
}

// Common subjects for dropdown/suggestions
export const commonSubjects = [
  "Informații generale despre TBSA",
  "Demo și prezentare platformă",
  "Prețuri și planuri de abonament",
  "Suport tehnic",
  "Implementare pentru asociația mea",
  "Întrebări despre funcționalități",
  "Colaborare și parteneriat",
  "Feedback și sugestii",
  "Altceva",
] as const;

export type CommonSubject = (typeof commonSubjects)[number];
