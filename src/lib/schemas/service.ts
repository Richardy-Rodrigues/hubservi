import { z } from "zod";

// A regra price_max >= price_min espelha a constraint services_price_range_check
// (supabase/migrations/20260514100300_services_price_range_check.sql). Alterar uma
// exige alterar a outra.
export const serviceSchema = z
  .object({
    title: z.string().trim().min(3, "Título deve ter pelo menos 3 caracteres").max(100),
    description: z.string().trim().min(10, "Descrição deve ter pelo menos 10 caracteres").max(2000),
    category_id: z.string().uuid("Selecione uma categoria"),
    price_min: z.number().min(0, "Preço mínimo deve ser >= 0"),
    price_max: z.number().nullable(),
    price_type: z.enum(["fixed", "hourly", "negotiable"]),
    location: z.string().max(100).optional(),
    is_active: z.boolean(),
  })
  .refine((d) => d.price_max == null || d.price_max >= d.price_min, {
    message: "Preço máximo deve ser maior ou igual ao mínimo",
    path: ["price_max"],
  });

export type ServiceInput = z.infer<typeof serviceSchema>;
