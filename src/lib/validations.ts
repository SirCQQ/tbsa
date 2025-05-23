import { z } from "zod";

// User validation schemas
export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .refine((password) => password.trim().length > 0, {
      message: "Password cannot be empty or only whitespace",
    }),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  role: z.enum(["ADMINISTRATOR", "OWNER"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .refine((password) => password.trim().length > 0, {
      message: "Password cannot be empty or only whitespace",
    }),
});

export const registerSchema = userSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Building validation schemas
export const buildingSchema = z.object({
  name: z.string().min(1, "Building name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().optional(),
  readingDeadline: z.number().min(1).max(31),
});

// Apartment validation schemas
export const apartmentSchema = z.object({
  number: z.string().min(1, "Apartment number is required"),
  floor: z.number().optional(),
  rooms: z.number().optional(),
  buildingId: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
});

// Water reading validation schemas
export const waterReadingSchema = z.object({
  apartmentId: z.string().uuid(),
  day: z.number().min(1).max(31),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2050),
  reading: z.number().min(0, "Reading must be positive"),
});

// Update schemas (for partial updates)
export const updateBuildingSchema = buildingSchema.partial();
export const updateApartmentSchema = apartmentSchema.partial();
export const updateUserSchema = userSchema.omit({ password: true }).partial();

// Response types
export type User = z.infer<typeof userSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type Building = z.infer<typeof buildingSchema>;
export type Apartment = z.infer<typeof apartmentSchema>;
export type WaterReading = z.infer<typeof waterReadingSchema>;
