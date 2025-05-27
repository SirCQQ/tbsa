import { z } from "zod";

// Building type enum to match Prisma (simplified to only residential for now)
export const BuildingTypeEnum = z.enum(["RESIDENTIAL"]);

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

  // Extended building information (type is always RESIDENTIAL, so we don't include it in the form)
  floors: z
    .number()
    .int("Numărul de etaje trebuie să fie un număr întreg")
    .min(1, "Clădirea trebuie să aibă cel puțin 1 etaj")
    .max(100, "Numărul de etaje nu poate fi mai mare de 100")
    .optional(),
  totalApartments: z
    .number()
    .int("Numărul de apartamente trebuie să fie un număr întreg")
    .min(1, "Clădirea trebuie să aibă cel puțin 1 apartament")
    .max(1000, "Numărul de apartamente nu poate fi mai mare de 1000")
    .optional(),
  yearBuilt: z
    .number()
    .int("Anul construcției trebuie să fie un număr întreg")
    .min(1800, "Anul construcției nu poate fi mai mic de 1800")
    .max(
      new Date().getFullYear() + 5,
      "Anul construcției nu poate fi în viitorul îndepărtat"
    )
    .optional(),
  description: z
    .string()
    .max(500, "Descrierea nu poate avea mai mult de 500 de caractere")
    .optional(),
  hasElevator: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
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

// Schema for creating apartments along with building
export const CreateApartmentSchema = z.object({
  number: z
    .string()
    .min(1, "Numărul apartamentului este obligatoriu")
    .max(10, "Numărul apartamentului nu poate avea mai mult de 10 caractere"),
  floor: z
    .number()
    .int("Etajul trebuie să fie un număr întreg")
    .min(0, "Etajul nu poate fi negativ")
    .max(100, "Etajul nu poate fi mai mare de 100")
    .optional(),
  rooms: z
    .number()
    .int("Numărul de camere trebuie să fie un număr întreg")
    .min(1, "Apartamentul trebuie să aibă cel puțin 1 cameră")
    .max(20, "Numărul de camere nu poate fi mai mare de 20")
    .optional(),
});

// Extended schema for creating building with apartments
export const CreateBuildingWithApartmentsSchema = CreateBuildingSchema.extend({
  apartments: z
    .array(CreateApartmentSchema)
    .max(1000, "Nu se pot crea mai mult de 1000 de apartamente odată")
    .optional(),

  // Option to auto-generate apartments based on floors and apartments per floor
  autoGenerateApartments: z.boolean().default(false),
  apartmentsPerFloor: z
    .number()
    .int("Numărul de apartamente pe etaj trebuie să fie un număr întreg")
    .min(1, "Trebuie să fie cel puțin 1 apartament pe etaj")
    .max(50, "Nu pot fi mai mult de 50 de apartamente pe etaj")
    .optional(),
});

// Type exports
export type CreateBuildingData = z.infer<typeof CreateBuildingSchema>;
export type CreateBuildingWithApartmentsData = z.infer<
  typeof CreateBuildingWithApartmentsSchema
>;
export type CreateApartmentData = z.infer<typeof CreateApartmentSchema>;
export type UpdateBuildingData = z.infer<typeof UpdateBuildingSchema>;
export type BuildingQueryParams = z.infer<typeof BuildingQuerySchema>;
export type BuildingIdParams = z.infer<typeof BuildingIdSchema>;
export type BuildingType = z.infer<typeof BuildingTypeEnum>;
