import { z } from "zod";

// Import schemas from centralized schemas folder
import {
  UserSchema,
  LoginSchema,
  RegisterSchema,
  UpdateUserSchema,
} from "../schemas/user";
import {
  CreateBuildingSchema,
  UpdateBuildingSchema,
} from "../schemas/building";
import { ApartmentSchema, UpdateApartmentSchema } from "../schemas/apartment";
import { ContactFormSchema } from "../schemas/contact";

// Validation types inferred from Zod schemas
export type UserValidation = z.infer<typeof UserSchema>;
export type LoginValidation = z.infer<typeof LoginSchema>;
export type RegisterValidation = z.infer<typeof RegisterSchema>;
export type BuildingValidation = z.infer<typeof CreateBuildingSchema>;
export type ApartmentValidation = z.infer<typeof ApartmentSchema>;
export type ContactFormValidation = z.infer<typeof ContactFormSchema>;

// Update validation types
export type UpdateBuildingValidation = z.infer<typeof UpdateBuildingSchema>;
export type UpdateApartmentValidation = z.infer<typeof UpdateApartmentSchema>;
export type UpdateUserValidation = z.infer<typeof UpdateUserSchema>;

// Form validation types (aliases for clarity)
export type LoginFormValidation = LoginValidation;
export type RegisterFormValidation = RegisterValidation;
export type BuildingFormValidation = BuildingValidation;
export type ApartmentFormValidation = ApartmentValidation;
