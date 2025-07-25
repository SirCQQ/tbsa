import { z } from "zod";
import { BuildingType } from "@prisma/client";

export const createBuildingSchema = z.object({
  name: z
    .string()
    .min(1, "Building name is required")
    .max(100, "Building name must be less than 100 characters"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must be less than 255 characters"),
  type: z.nativeEnum(BuildingType, {
    errorMap: () => ({ message: "Invalid building type" }),
  }),
  floors: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val), "Floors must be a valid number")
    .refine((val) => Number.isInteger(val), "Floors must be a whole number")
    .refine((val) => val >= 1, "Building must have at least 1 floor")
    .refine((val) => val <= 100, "Building cannot have more than 100 floors"),
  totalApartments: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val), "Total apartments must be a valid number")
    .refine(
      (val) => Number.isInteger(val),
      "Total apartments must be a whole number"
    )
    .refine((val) => val >= 1, "Building must have at least 1 apartment")
    .refine(
      (val) => val <= 120,
      "Building cannot have more than 120 apartments"
    ),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  readingDay: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val), "Reading day must be a valid number")
    .refine(
      (val) => Number.isInteger(val),
      "Reading day must be a whole number"
    )
    .refine((val) => val >= 1, "Reading day must be between 1 and 31")
    .refine((val) => val <= 31, "Reading day must be between 1 and 31")
    .optional(),
});

export const getBuildingByCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Building code must be at least 6 characters")
    .max(8, "Building code must be at most 8 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Building code must contain only uppercase letters and numbers"
    ),
});

export const buildingIdSchema = z.object({
  id: z.string().uuid("Invalid building ID format"),
});

// CreateBuildingInput schema and type
export const createBuildingInputSchema = z.object({
  name: z.string(),
  address: z.string(),
  type: z.enum([
    BuildingType.COMMERCIAL,
    BuildingType.MIXED,
    BuildingType.RESIDENTIAL,
  ]),
  floors: z.number().int().min(1, "Clădirea trebuie să aibă cel puțin un etaj"),
  totalApartments: z
    .number()
    .int()
    .min(1, "Clădirea trebuie să aibă cel puțin un apartament"),
  description: z
    .string()
    .max(500, "Descrierea nu poate depăși 500 de caractere")
    .nullable()
    .optional(),
  readingDay: z
    .number()
    .int()
    .min(1, "Ziua de citire trebuie să fie între 1 și 31")
    .max(31, "Ziua de citire trebuie să fie între 1 și 31")
    .nullable()
    .optional(),
  organizationId: z
    .string()
    .uuid("ID-ul organizației trebuie să fie un UUID valid"),
});

// UpdateBuildingInput schema and type
export const updateBuildingInputSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  floors: z
    .number()
    .int()
    .min(1, "Clădirea trebuie să aibă cel puțin un etaj")
    .optional(),
  description: z
    .string()
    .max(500, "Descrierea nu poate depăși 500 de caractere")
    .nullable()
    .optional(),
});

export type UpdateBuildingInput = z.infer<typeof updateBuildingInputSchema>;
export type CreateBuildingInput = z.infer<typeof createBuildingInputSchema>;

export type CreateBuildingFormData = z.infer<typeof createBuildingSchema>;
export type GetBuildingByCodeFormData = z.infer<typeof getBuildingByCodeSchema>;
export type BuildingIdFormData = z.infer<typeof buildingIdSchema>;
