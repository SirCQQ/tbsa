import { z } from "zod";

export const ApartmentSchema = z.object({
  number: z
    .string()
    .min(1, "Numărul apartamentului este obligatoriu")
    .max(10, "Numărul apartamentului nu poate avea mai mult de 10 caractere")
    .regex(
      /^[A-Za-z0-9]+$/,
      "Numărul apartamentului poate conține doar litere și cifre"
    ),
  floor: z
    .number()
    .int("Etajul trebuie să fie un număr întreg")
    .min(-5, "Etajul nu poate fi mai mic de -5")
    .max(100, "Etajul nu poate fi mai mare de 100"),
  rooms: z
    .number()
    .int("Numărul de camere trebuie să fie un număr întreg")
    .min(1, "Apartamentul trebuie să aibă cel puțin o cameră")
    .max(20, "Apartamentul nu poate avea mai mult de 20 de camere"),
  buildingId: z.string().uuid("ID-ul clădirii trebuie să fie un UUID valid"),
  ownerId: z
    .string()
    .uuid("ID-ul proprietarului trebuie să fie un UUID valid")
    .optional(),
});

export const UpdateApartmentSchema = ApartmentSchema.partial().extend({
  id: z.string().uuid("ID-ul apartamentului trebuie să fie un UUID valid"),
});

export const ApartmentQuerySchema = z.object({
  buildingId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
  search: z.string().optional(),
});

export type ApartmentInput = z.infer<typeof ApartmentSchema>;
export type UpdateApartmentInput = z.infer<typeof UpdateApartmentSchema>;
export type ApartmentQuery = z.infer<typeof ApartmentQuerySchema>;
