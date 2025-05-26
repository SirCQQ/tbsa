import { z } from "zod";

export const ContactFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Numele nu poate depăși 50 de caractere")
    .regex(/^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/, "Numele poate conține doar litere"),

  lastName: z
    .string()
    .min(2, "Prenumele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Prenumele nu poate depăși 50 de caractere")
    .regex(/^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/, "Prenumele poate conține doar litere"),

  email: z
    .string()
    .email("Adresa de email nu este validă")
    .min(1, "Email-ul este obligatoriu"),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+40|0)[0-9]{9}$/.test(val.replace(/\s/g, "")),
      "Numărul de telefon trebuie să fie în format românesc valid"
    ),

  subject: z
    .string()
    .min(5, "Subiectul trebuie să aibă cel puțin 5 caractere")
    .max(100, "Subiectul nu poate depăși 100 de caractere"),

  message: z
    .string()
    .min(20, "Mesajul trebuie să aibă cel puțin 20 de caractere")
    .max(1000, "Mesajul nu poate depăși 1000 de caractere"),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;
