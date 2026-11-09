import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { ChipCheckbox } from "../../components/profile/ChipCheckbox";
import { RadioCard } from "../../components/profile/RadioCard";
import { UnitInput } from "../../components/profile/UnitInput";
import { saveProfile, type ProfileFormValues } from "../../lib/profile-api";
import { profileSetupSchema } from "../../lib/profile-schema";
import {
  daysOptions,
  type Equipment,
  equipmentOptions,
  goalOptions,
  labels,
  levelOptions,
} from "../../lib/profile-options";

function maskDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function ProfileSetupPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: saveProfile,
    onSuccess: () => navigate({ to: "/" }),
  });
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: { equipment: [] },
  });
  const selectedGoal = useWatch({ control, name: "goal" });
  const selectedLevel = useWatch({ control, name: "level" });
  const selectedDays = useWatch({ control, name: "days" });
  const selectedEquipment = useWatch({ control, name: "equipment" }) ?? [];

  const onSubmit = handleSubmit((values) => mutation.mutate(values));
  const birthDateField = register("birthDate");

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="mb-5 text-2xl font-extrabold tracking-tight text-foreground">
            TRAIN <span className="text-primary">UP</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Cadastro do perfil
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Insira suas informações para começarmos a acompanhar sua evolução!
          </p>
        </header>

        <form className="space-y-6" noValidate onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <h2 className="mb-5 text-lg font-bold uppercase tracking-wide">
                Dados físicos e medidas
              </h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de nascimento</Label>
                  <Input
                    id="birthDate"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday"
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    {...birthDateField}
                    onChange={(event) => {
                      event.currentTarget.value = maskDate(
                        event.currentTarget.value,
                      );
                      void birthDateField.onChange(event);
                    }}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-danger">
                      {errors.birthDate.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="heightCm">Altura</Label>
                    <UnitInput
                      id="heightCm"
                      unit="cm"
                      type="text"
                      inputMode="decimal"
                      placeholder="170"
                      aria-describedby={
                        errors.heightCm ? "heightCm-error" : undefined
                      }
                      {...register("heightCm")}
                    />
                    {errors.heightCm && (
                      <p id="heightCm-error" className="text-sm text-danger">
                        {errors.heightCm.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightKg">Peso</Label>
                    <UnitInput
                      id="weightKg"
                      unit="kg"
                      type="text"
                      inputMode="decimal"
                      placeholder="72"
                      aria-describedby={
                        errors.weightKg ? "weightKg-error" : undefined
                      }
                      {...register("weightKg")}
                    />
                    {errors.weightKg && (
                      <p id="weightKg-error" className="text-sm text-danger">
                        {errors.weightKg.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-5">
                  <h3 className="font-semibold">Medidas corporais</h3>
                  <p className="text-sm text-muted-foreground">
                    Use uma fita métrica, sem apertar.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {(
                      [
                        ["chestCm", "Peito", "Na linha dos mamilos"],
                        ["waistCm", "Cintura", "Na altura do umbigo"],
                        ["hipCm", "Quadril", "Na parte mais larga"],
                      ] as const
                    ).map(([name, label, hint]) => (
                      <div key={name} className="space-y-2">
                        <Label htmlFor={name}>{label}</Label>
                        <UnitInput
                          id={name}
                          unit="cm"
                          type="text"
                          inputMode="decimal"
                          placeholder="--"
                          aria-describedby={
                            errors[name] ? `${name}-error` : undefined
                          }
                          {...register(name)}
                        />
                        {errors[name] ? (
                          <p
                            id={`${name}-error`}
                            className="text-sm text-danger"
                          >
                            {errors[name]?.message}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {hint}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <h2 className="mb-5 text-lg font-bold uppercase tracking-wide">
                Sua rotina e metas
              </h2>

              <fieldset>
                <legend className="mb-2 font-medium">Objetivo</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {goalOptions.map((goal) => (
                    <RadioCard
                      key={goal}
                      value={goal}
                      checked={selectedGoal === goal}
                      {...register("goal")}
                    >
                      {labels.goal[goal]}
                    </RadioCard>
                  ))}
                </div>
                {errors.goal && (
                  <p className="mt-2 text-sm text-danger">
                    {errors.goal.message}
                  </p>
                )}
              </fieldset>

              <fieldset className="mt-6">
                <legend className="mb-2 font-medium">
                  Nível de experiência
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {levelOptions.map((level) => (
                    <RadioCard
                      key={level}
                      value={level}
                      checked={selectedLevel === level}
                      {...register("level")}
                      className="min-h-32"
                    >
                      {labels.level[level]}
                      <span className="mt-1 block text-sm font-normal leading-snug text-muted-foreground">
                        {labels.levelDescription[level]}
                      </span>
                    </RadioCard>
                  ))}
                </div>
                {errors.level && (
                  <p className="mt-2 text-sm text-danger">
                    {errors.level.message}
                  </p>
                )}
              </fieldset>

              <fieldset className="mt-6">
                <legend className="mb-2 font-medium">
                  Dias de treino por semana
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {daysOptions.map((day) => (
                    <RadioCard
                      key={day}
                      value={day}
                      checked={selectedDays === day}
                      {...register("days", { valueAsNumber: true })}
                      className="size-12 items-center justify-center rounded-xl p-0"
                    >
                      {labels.days[day]}
                    </RadioCard>
                  ))}
                </div>
                {errors.days && (
                  <p className="mt-2 text-sm text-danger">
                    {errors.days.message}
                  </p>
                )}
              </fieldset>
            </section>
          </div>

          <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <fieldset>
              <legend className="text-lg font-bold uppercase tracking-wide">
                Equipamentos em casa
              </legend>
              <p className="mb-4 text-sm text-muted-foreground">
                Marque tudo o que você tem. Escolher “Nenhum” desmarca as outras
                opções.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {equipmentOptions.map((equipment) => (
                  <ChipCheckbox
                    key={equipment}
                    name="equipment"
                    value={equipment}
                    checked={selectedEquipment.includes(equipment)}
                    onBlur={register("equipment").onBlur}
                    ref={register("equipment").ref}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      const current = getValues("equipment") ?? [];
                      const next: Equipment[] =
                        equipment === "none"
                          ? checked
                            ? ["none"]
                            : []
                          : checked
                            ? [
                                ...current.filter((item) => item !== "none"),
                                equipment,
                              ]
                            : current.filter((item) => item !== equipment);
                      setValue("equipment", next, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    {labels.equipment[equipment]}
                  </ChipCheckbox>
                ))}
              </div>
              {errors.equipment && (
                <p className="mt-3 text-sm text-danger">
                  {errors.equipment.message}
                </p>
              )}
            </fieldset>
          </section>

          {mutation.isError && (
            <p className="text-right text-sm text-danger">
              Não foi possível salvar seu perfil. Tente novamente.
            </p>
          )}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.history.back()}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              className="min-w-56"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Salvando..." : "Salvar e continuar"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/_auth/profile-setup")({
  component: ProfileSetupPage,
});
