import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { createMeasurement, type MeasurementInput } from "./dashboard-api";
import { todayLocalDate } from "./format";

type Props = {
  weightKg: number;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  onClose: () => void;
};

type Field = "weightKg" | "chestCm" | "waistCm" | "hipCm";
const decimal = /^\d+(?:[.,]\d{1,2})?$/;
const fields: { name: Field; label: string; min: number; max: number; unit: string; required?: boolean }[] = [
  { name: "weightKg", label: "Peso", min: 30, max: 300, unit: "kg", required: true },
  { name: "chestCm", label: "Peito", min: 30, max: 250, unit: "cm" },
  { name: "waistCm", label: "Cintura", min: 30, max: 250, unit: "cm" },
  { name: "hipCm", label: "Quadril", min: 30, max: 250, unit: "cm" },
];

export function MeasurementDialog(props: Props) {
  const [measuredAt, setMeasuredAt] = useState(todayLocalDate);
  const [values, setValues] = useState<Record<Field, string>>(() => ({
    weightKg: String(props.weightKg),
    chestCm: props.chestCm == null ? "" : String(props.chestCm),
    waistCm: props.waistCm == null ? "" : String(props.waistCm),
    hipCm: props.hipCm == null ? "" : String(props.hipCm),
  }));
  const [errors, setErrors] = useState<Partial<Record<Field | "measuredAt", string>>>({});
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (body: MeasurementInput) => createMeasurement(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      props.onClose();
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<Field | "measuredAt", string>> = {};
    const today = todayLocalDate();
    if (measuredAt && measuredAt > today) nextErrors.measuredAt = "A data não pode ser futura";
    const parsed: Partial<Record<Field, number>> = {};
    for (const field of fields) {
      const value = values[field.name].trim();
      if (!value && !field.required) continue;
      if (!value || !decimal.test(value)) {
        nextErrors[field.name] = field.required ? "Informe um número válido" : "Informe um número válido ou deixe em branco";
        continue;
      }
      const number = Number(value.replace(",", "."));
      if (number < field.min || number > field.max) {
        nextErrors[field.name] = `Informe um valor entre ${field.min} e ${field.max}`;
      } else parsed[field.name] = number;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    mutation.mutate({
      ...(measuredAt ? { measuredAt } : {}),
      weightKg: parsed.weightKg!,
      ...(parsed.chestCm !== undefined ? { chestCm: parsed.chestCm } : {}),
      ...(parsed.waistCm !== undefined ? { waistCm: parsed.waistCm } : {}),
      ...(parsed.hipCm !== undefined ? { hipCm: parsed.hipCm } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) props.onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="measurement-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-2xl sm:p-8">
        <h2 id="measurement-title" className="text-2xl font-bold">Registrar medição</h2>
        <p className="mt-2 text-muted-foreground">Acompanhe sua evolução registrando seus dados.</p>
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-2">
            <label className="block font-medium" htmlFor="measuredAt">Data</label>
            <input id="measuredAt" type="date" max={todayLocalDate()} value={measuredAt} onChange={(event) => setMeasuredAt(event.target.value)} className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground" />
            {errors.measuredAt && <p className="text-sm text-danger">{errors.measuredAt}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div className="space-y-2" key={field.name}>
                <label className="block font-medium" htmlFor={field.name}>{field.label} ({field.unit}){field.required ? " *" : ""}</label>
                <input id={field.name} inputMode="decimal" type="text" value={values[field.name]} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground" />
                {errors[field.name] && <p className="text-sm text-danger">{errors[field.name]}</p>}
              </div>
            ))}
          </div>
          {mutation.isError && <p className="text-sm text-danger">Não foi possível salvar a medição. Tente novamente.</p>}
          <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
            <button type="button" onClick={props.onClose} className="rounded-full border border-border px-5 py-3 font-semibold hover:bg-input">Cancelar</button>
            <button type="submit" disabled={mutation.isPending} className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">{mutation.isPending ? "Salvando..." : "Salvar medição"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
