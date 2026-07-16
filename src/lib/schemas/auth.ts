import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

// userType alimenta raw_user_meta_data, lido pelo trigger handle_new_user para
// popular profiles.user_type. Depois de criado, o valor e imutavel (trigger
// prevent_user_type_change).
export const registerSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  fullName: z.string().trim().min(2, "Nome obrigatório"),
  userType: z.enum(["client", "provider"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
