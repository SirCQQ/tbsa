import { z } from "zod";

export const createWaterMeterSchema = z.object({
  serialNumber: z
    .string()
    .min(1, "Numărul de serie este obligatoriu")
    .max(50, "Numărul de serie nu poate depăși 50 de caractere")
    .regex(
      /^[A-Za-z0-9\-_]+$/,
      "Numărul de serie poate conține doar litere, cifre, cratime și underscore"
    ),
  apartmentId: z
    .string()
    .uuid("ID-ul apartamentului trebuie să fie un UUID valid"),
  initialValue: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        if (val === "") return 0;
        return parseFloat(val);
      }
      return val;
    })
    .refine(
      (val) => !isNaN(val),
      "Valoarea inițială trebuie să fie un număr valid"
    )
    .refine((val) => val >= 0, "Valoarea inițială nu poate fi negativă")
    .refine(
      (val) => val <= 999999,
      "Valoarea inițială nu poate depăși 999,999"
    ),
  location: z
    .string()
    .max(100, "Locația nu poate depăși 100 de caractere")
    .optional(),
  brand: z.string().max(50, "Marca nu poate depăși 50 de caractere").optional(),
  model: z
    .string()
    .max(50, "Modelul nu poate depăși 50 de caractere")
    .optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateWaterMeterSchema = createWaterMeterSchema.partial().omit({
  apartmentId: true,
  initialValue: true, // Can't change initial value after creation
});

export const waterMeterIdSchema = z.object({
  id: z.string().uuid("ID-ul contorului trebuie să fie un UUID valid"),
});

export const waterMeterByApartmentSchema = z.object({
  apartmentId: z
    .string()
    .uuid("ID-ul apartamentului trebuie să fie un UUID valid"),
});

export const bulkCreateWaterMetersSchema = z.object({
  apartmentId: z
    .string()
    .uuid("ID-ul apartamentului trebuie să fie un UUID valid"),
  waterMeters: z
    .array(
      z.object({
        serialNumber: z
          .string()
          .min(1, "Numărul de serie este obligatoriu")
          .max(50, "Numărul de serie nu poate depăși 50 de caractere")
          .regex(
            /^[A-Za-z0-9\-_]+$/,
            "Numărul de serie poate conține doar litere, cifre, cratime și underscore"
          ),
        initialValue: z
          .number()
          .min(0, "Valoarea inițială nu poate fi negativă")
          .max(999999, "Valoarea inițială nu poate depăși 999,999"),
        location: z
          .string()
          .max(100, "Locația nu poate depăși 100 de caractere")
          .optional(),
        brand: z
          .string()
          .max(50, "Marca nu poate depăși 50 de caractere")
          .optional(),
        model: z
          .string()
          .max(50, "Modelul nu poate depăși 50 de caractere")
          .optional(),
        isActive: z.boolean().optional().default(true),
      })
    )
    .min(1, "Trebuie să existe cel puțin un contor")
    .max(10, "Nu se pot crea mai mult de 10 contoare odată"),
});

// Form-specific type for the add water meter modal
export const addWaterMeterFormSchema = z.object({
  serialNumber: z.string().min(1, "Numărul de serie este obligatoriu"),
  initialValue: z.string().min(1, "Valoarea inițială este obligatorie"),
  location: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CreateWaterMeterFormData = z.infer<typeof createWaterMeterSchema>;
export type UpdateWaterMeterFormData = z.infer<typeof updateWaterMeterSchema>;
export type BulkCreateWaterMetersFormData = z.infer<
  typeof bulkCreateWaterMetersSchema
>;
export type AddWaterMeterFormData = z.infer<typeof addWaterMeterFormSchema>;
