import { z } from "zod";
import {
  equipmentOptions,
  goalOptions,
  levelOptions,
} from "./profile-options";

const decimalPattern = /^\d+(?:[.,]\d+)?$/;

function requiredMeasurement(label: string, minimum: number, maximum: number) {
  return z
    .string()
    .min(1, `${label} é obrigatório`)
    .refine((value) => decimalPattern.test(value), {
      error: "Informe um número válido",
    })
    .refine(
      (value) => {
        if (!decimalPattern.test(value)) return true;
        const number = Number(value.replace(",", "."));
        return number >= minimum && number <= maximum;
      },
      { error: `Informe um valor entre ${minimum} e ${maximum}` },
    );
}

function optionalMeasurement(minimum: number, maximum: number) {
  return z.union([
    z.literal(""),
    z
      .string()
      .refine((value) => decimalPattern.test(value), {
        error: "Informe um número válido",
      })
      .refine(
        (value) => {
          if (!decimalPattern.test(value)) return true;
          const number = Number(value.replace(",", "."));
          return number >= minimum && number <= maximum;
        },
        { error: `Informe um valor entre ${minimum} e ${maximum}` },
      ),
  ]);
}

function isRealPastDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const now = new Date();

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date < new Date(now.getFullYear(), now.getMonth(), now.getDate())
  );
}

export const profileSetupSchema = z.object({
  birthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine(isRealPastDate, {
      error: "Informe uma data real no passado no formato dd/mm/aaaa",
    }),
  heightCm: requiredMeasurement("Altura", 100, 250),
  weightKg: requiredMeasurement("Peso", 30, 300),
  chestCm: optionalMeasurement(30, 250),
  waistCm: optionalMeasurement(30, 250),
  hipCm: optionalMeasurement(30, 250),
  goal: z.enum(goalOptions, { error: "Selecione um objetivo" }),
  level: z.enum(levelOptions, { error: "Selecione seu nível de experiência" }),
  days: z
    .number({ error: "Selecione os dias de treino por semana" })
    .int("Selecione uma opção válida")
    .min(1, "Selecione uma opção válida")
    .max(7, "Selecione uma opção válida"),
  equipment: z
    .array(z.enum(equipmentOptions))
    .min(1, "Selecione pelo menos um equipamento"),
});
