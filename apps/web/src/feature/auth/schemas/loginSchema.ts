import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "E-mail inválido" }).min(1, "E-mail é obrigatório"),

  password: z.string().min(8, "Senha deve possuir pelo menos 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
