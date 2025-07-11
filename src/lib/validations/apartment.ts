import { z } from "zod";

export const createApartmentSchema = z.object({
  number: z
    .string()
    .min(1, "Numărul apartamentului este obligatoriu")
    .max(10, "Numărul apartamentului nu poate depăși 10 caractere")
    .regex(
      /^[A-Za-z0-9]+$/,
      "Numărul apartamentului poate conține doar litere și cifre"
    ),
  floor: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val), "Etajul trebuie să fie un număr valid")
    .refine(
      (val) => Number.isInteger(val),
      "Etajul trebuie să fie un număr întreg"
    )
    .refine((val) => val >= 0, "Etajul nu poate fi negativ")
    .refine((val) => val <= 50, "Etajul nu poate depăși 50"),
  buildingId: z.string().uuid("ID-ul clădirii trebuie să fie un UUID valid"),
  isOccupied: z.boolean().optional().default(false),
  occupantCount: z
    .union([z.string(), z.number()])
    .optional()
    .default(0)
    .transform((val) => {
      if (val === undefined || val === null || val === "") return 0;
      return typeof val === "string" ? parseInt(val, 10) : val;
    })
    .refine(
      (val) => !isNaN(val),
      "Numărul de ocupanți trebuie să fie un număr valid"
    )
    .refine(
      (val) => Number.isInteger(val),
      "Numărul de ocupanți trebuie să fie un număr întreg"
    )
    .refine((val) => val >= 0, "Numărul de ocupanți nu poate fi negativ")
    .refine((val) => val <= 20, "Numărul de ocupanți nu poate depăși 20"),
  surface: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return typeof val === "string" ? parseFloat(val) : val;
    })
    .refine(
      (val) => val === undefined || !isNaN(val),
      "Suprafața trebuie să fie un număr valid"
    )
    .refine(
      (val) => val === undefined || val > 0,
      "Suprafața trebuie să fie mai mare decât 0"
    )
    .refine(
      (val) => val === undefined || val <= 1000,
      "Suprafața nu poate depăși 1000 m²"
    ),
  description: z
    .string()
    .max(500, "Descrierea nu poate depăși 500 de caractere")
    .optional(),
});

// Form schema that matches the input field types
export const editApartmentFormSchema = z.object({
  number: z.string().min(1, "Numărul apartamentului este obligatoriu"),
  floor: z.string().min(1, "Etajul este obligatoriu"),
  isOccupied: z.boolean(),
  occupantCount: z.string(),
  surface: z.string().optional(),
  description: z.string().optional(),
});

export const apartmentIdSchema = z.object({
  id: z.string().uuid("ID-ul apartamentului trebuie să fie un UUID valid"),
});

export const createBulkApartmentsSchema = z.object({
  buildingId: z.string().uuid("ID-ul clădirii trebuie să fie un UUID valid"),
  apartments: z
    .array(
      z.object({
        number: z
          .string()
          .min(1, "Numărul apartamentului este obligatoriu")
          .max(10, "Numărul apartamentului nu poate depăși 10 caractere")
          .regex(
            /^[A-Za-z0-9]+$/,
            "Numărul apartamentului poate conține doar litere și cifre"
          ),
        floor: z
          .number()
          .int("Etajul trebuie să fie un număr întreg")
          .min(0, "Etajul nu poate fi negativ")
          .max(50, "Etajul nu poate depăși 50"),
        isOccupied: z.boolean().optional().default(false),
        occupantCount: z
          .number()
          .int("Numărul de ocupanți trebuie să fie un număr întreg")
          .min(0, "Numărul de ocupanți nu poate fi negativ")
          .max(20, "Numărul de ocupanți nu poate depăși 20")
          .optional()
          .default(0),
        surface: z
          .number()
          .positive("Suprafața trebuie să fie mai mare decât 0")
          .max(1000, "Suprafața nu poate depăși 1000 m²")
          .optional(),
        description: z
          .string()
          .max(500, "Descrierea nu poate depăși 500 de caractere")
          .optional(),
      })
    )
    .min(1, "Trebuie să existe cel puțin un apartament")
    .max(500, "Nu se pot crea mai mult de 500 de apartamente odată"),
});

export type CreateApartmentFormData = z.infer<typeof createApartmentSchema>;

export type CreateBulkApartmentsFormData = z.infer<
  typeof createBulkApartmentsSchema
>;

export type EditApartmentFormData = z.infer<typeof editApartmentFormSchema>;
