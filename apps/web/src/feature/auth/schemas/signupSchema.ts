import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nome muito curto")
      .max(100, "Nome muito longo")
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),

    email: z.email({ error: "E-mail inválido" }).min(1, "E-mail é obrigatório"),

    password: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .max(50, "Máximo de 50 caracteres")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
        "A senha deve conter letra maiúscula, minúscula e número",
      ),
    confirmPassword: z.string().min(8, "Mínimo de 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type SignupFormData = z.infer<typeof signupSchema>;
