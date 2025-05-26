import { z } from "zod";

// Schema for creating a new building
export const CreateBuildingSchema = z.object({
  name: z
    .string()
    .min(2, "Numele clădirii trebuie să aibă cel puțin 2 caractere")
    .max(100, "Numele clădirii nu poate avea mai mult de 100 de caractere"),
  address: z
    .string()
    .min(5, "Adresa trebuie să aibă cel puțin 5 caractere")
    .max(200, "Adresa nu poate avea mai mult de 200 de caractere"),
  city: z
    .string()
    .min(2, "Orașul trebuie să aibă cel puțin 2 caractere")
    .max(100, "Orașul nu poate avea mai mult de 100 de caractere"),
  postalCode: z
    .string()
    .regex(/^\d{6}$/, "Codul poștal trebuie să aibă exact 6 cifre")
    .optional(),
  readingDeadline: z
    .number()
    .int("Termenul limită trebuie să fie un număr întreg")
    .min(1, "Termenul limită trebuie să fie între 1 și 31")
    .max(31, "Termenul limită trebuie să fie între 1 și 31")
    .default(25),
});

// Schema for updating a building (all fields optional except id)
export const UpdateBuildingSchema = CreateBuildingSchema.partial();

// Schema for building query parameters
export const BuildingQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, "Pagina trebuie să fie un număr pozitiv"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine(
      (val) => val > 0 && val <= 100,
      "Limita trebuie să fie între 1 și 100"
    ),
  search: z.string().optional(),
});

// Schema for building ID parameter
export const BuildingIdSchema = z.object({
  id: z.string().uuid("ID-ul clădirii trebuie să fie un UUID valid"),
});

// Type exports
export type CreateBuildingData = z.infer<typeof CreateBuildingSchema>;
export type UpdateBuildingData = z.infer<typeof UpdateBuildingSchema>;
export type BuildingQueryParams = z.infer<typeof BuildingQuerySchema>;
export type BuildingIdParams = z.infer<typeof BuildingIdSchema>;
