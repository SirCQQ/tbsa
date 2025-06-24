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

export const updateApartmentSchema = createApartmentSchema.partial().omit({
  buildingId: true,
});

export const apartmentIdSchema = z.object({
  id: z.string().uuid("ID-ul apartamentului trebuie să fie un UUID valid"),
});

export type CreateApartmentFormData = z.infer<typeof createApartmentSchema>;
export type UpdateApartmentFormData = z.infer<typeof updateApartmentSchema>;
