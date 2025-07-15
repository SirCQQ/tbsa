import { z } from "zod";

// Apartment creation schema
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
    .nullable()
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
    )
    .optional()
    .nullable(),
  description: z
    .string()
    .max(500, "Descrierea nu poate depăși 500 de caractere")
    .optional()
    .nullable(),
});

// Apartment creation input with organizationId
export const createApartmentInput = createApartmentSchema.extend({
  organizationId: z.string().uuid("Organization Id needs to be a valid UUID"),
});

// Apartment edit form schema (all fields as strings, for form use)
export const editApartmentFormSchema = z.object({
  number: z.string().min(1, "Numărul apartamentului este obligatoriu"),
  floor: z.string().min(1, "Etajul este obligatoriu"),
  isOccupied: z.boolean(),
  occupantCount: z.string(),
  surface: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

// Apartment ID schema
export const apartmentIdSchema = z.object({
  id: z.string().uuid("ID-ul apartamentului trebuie să fie un UUID valid"),
});

// Bulk apartments creation schema
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
        isOccupied: z.boolean().optional().nullable().default(false),
        occupantCount: z
          .number()
          .int("Numărul de ocupanți trebuie să fie un număr întreg")
          .min(0, "Numărul de ocupanți nu poate fi negativ")
          .max(20, "Numărul de ocupanți nu poate depăși 20")
          .optional()
          .nullable()
          .default(0),
        surface: z
          .number()
          .positive("Suprafața trebuie să fie mai mare decât 0")
          .max(1000, "Suprafața nu poate depăși 1000 m²")
          .optional()
          .nullable(),
        description: z
          .string()
          .max(500, "Descrierea nu poate depăși 500 de caractere")
          .optional()
          .nullable(),
      })
    )
    .min(1, "Trebuie să existe cel puțin un apartament")
    .max(500, "Nu se pot crea mai mult de 500 de apartamente odată"),
});

// Bulk apartments input schema (with organizationId)
export const createBulkApartmentsInputSchema =
  createBulkApartmentsSchema.extend({
    organizationId: z.string().uuid("Organization Id needs to be a valid UUID"),
  });

// ApartmentWithBuilding schema
export const apartmentWithBuildingSchema = createApartmentSchema.extend({
  id: z.string().uuid(),
  building: z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string(),
    organizationId: z.string().uuid(),
  }),
});

// ApartmentWithCounts schema
export const apartmentWithCountsSchema = createApartmentSchema.extend({
  id: z.string().uuid(),
  building: z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string(),
  }),
  _count: z.object({
    apartmentResidents: z.number().int(),
    waterMeters: z.number().int(),
  }),
});

// Bulk creation result schema
export const bulkCreationResultSchema = z.object({
  success: z.boolean(),
  created: z.array(apartmentWithBuildingSchema),
  errors: z.array(
    z.object({
      apartment: z.object({
        number: z.string(),
        floor: z.number(),
      }),
      error: z.string(),
    })
  ),
  total: z.number().int(),
  successCount: z.number().int(),
  errorCount: z.number().int(),
});

export type BulkCreationResult = z.infer<typeof bulkCreationResultSchema>;

export type CreateBulkApartmentsFormData = z.infer<
  typeof createBulkApartmentsSchema
>;
export type CreateApartmentInput = z.infer<typeof createApartmentInput>;
export type CreateApartmentFormData = z.infer<typeof createApartmentSchema>;

export type CreateBulkApartmentsInput = z.infer<
  typeof createBulkApartmentsInputSchema
>;
export type EditApartmentFormData = z.infer<typeof editApartmentFormSchema>;
export type ApartmentWithBuilding = z.infer<typeof apartmentWithBuildingSchema>;
export type ApartmentWithCounts = z.infer<typeof apartmentWithCountsSchema>;
