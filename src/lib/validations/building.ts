import { z } from "zod";
import { BuildingType } from "@prisma/client/wasm";

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
    .number()
    .int("Floors must be a whole number")
    .min(1, "Building must have at least 1 floor")
    .max(100, "Building cannot have more than 100 floors"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  readingDay: z
    .number()
    .int("Reading day must be a whole number")
    .min(1, "Reading day must be between 1 and 31")
    .max(31, "Reading day must be between 1 and 31")
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

export type CreateBuildingFormData = z.infer<typeof createBuildingSchema>;
export type GetBuildingByCodeFormData = z.infer<typeof getBuildingByCodeSchema>;
export type BuildingIdFormData = z.infer<typeof buildingIdSchema>;
