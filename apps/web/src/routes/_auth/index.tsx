import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  BodyMeasuresChart,
  WeightChart,
} from "../../features/dashboard/DashboardCharts";
import { MeasurementDialog } from "../../features/dashboard/MeasurementDialog";
import { MetricCard } from "../../features/dashboard/MetricCard";
import {
  dashboardQueryOptions,
  type DashboardData,
} from "../../features/dashboard/dashboard-api";
import { formatFullDate, formatNumber } from "../../features/dashboard/format";

const bmiLabels = {
  underweight: "Abaixo do peso",
  normal: "Peso normal",
  overweight: "Sobrepeso",
  obese: "Obesidade",
} as const;

function HistoryTable({ items }: { items: DashboardData["history"] }) {
  return (
    <section className="flex min-h-[160px] flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-xl font-bold sm:text-2xl">Histórico de Medições</h2>
      <div className="mt-2 min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-border text-base font-semibold sm:text-lg">
              <th className="px-2 py-2">Data</th>
              <th className="px-2 py-2">Peso</th>
              <th className="px-2 py-2">Peito</th>
              <th className="px-2 py-2">Cintura</th>
              <th className="px-2 py-2">Quadril</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.date}
                className="border-b border-border last:border-0"
              >
                <td className="px-2 py-2">{formatFullDate(item.date)}</td>
                <td className="px-2 py-2">{formatNumber(item.weightKg)} kg</td>
                <td className="px-2 py-2">
                  {item.chestCm == null
                    ? "—"
                    : `${formatNumber(item.chestCm)} cm`}
                </td>
                <td className="px-2 py-2">
                  {item.waistCm == null
                    ? "—"
                    : `${formatNumber(item.waistCm)} cm`}
                </td>
                <td className="px-2 py-2">
                  {item.hipCm == null ? "—" : `${formatNumber(item.hipCm)} cm`}
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  Nenhuma medição registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DashboardPage() {
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const { data, isPending, isError } = useQuery(dashboardQueryOptions);
  if (isPending)
    return (
      <div className="py-20 text-center text-muted-foreground">
        Carregando seu dashboard...
      </div>
    );
  if (isError || !data)
    return (
      <div role="alert" className="py-20 text-center text-danger">
        Não foi possível carregar o dashboard. Tente novamente.
      </div>
    );

  const variationGood =
    (data.goal === "lose_weight" && data.weight.deltaKg < 0) ||
    (data.goal === "gain_muscle" && data.weight.deltaKg > 0);
  const lastMeasurement = data.history[0];
  const weightDelta =
    data.weight.deltaKg > 0
      ? `+${formatNumber(data.weight.deltaKg)}`
      : formatNumber(data.weight.deltaKg);

  return (
    <div className="flex flex-col gap-3 pb-3 lg:h-full lg:min-h-0">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard de Evolução
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Acompanhe o progresso do seu peso e medidas corporais.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMeasurementOpen(true)}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus aria-hidden="true" size={24} /> Registrar medição
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard title="Peso atual">
          <div className="flex items-center justify-between gap-3">
            <p className="text-3xl font-bold tracking-tight">
              {formatNumber(data.weight.currentKg)} kg
            </p>
            {data.weight.deltaKg !== 0 && (
              <span
                className={`shrink-0 rounded-xl px-3 py-1.5 text-base font-semibold ${variationGood ? "bg-accent/20 text-green-300" : "bg-input text-muted-foreground"}`}
              >
                {weightDelta} kg
              </span>
            )}
          </div>
          {data.weight.targetKg !== null && (
            <>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-input">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.max(0, Math.min(100, data.weight.progressPct ?? 0))}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-muted-foreground">
                <span className="mr-2 text-primary">◉</span>Meta:{" "}
                {formatNumber(data.weight.targetKg)} kg
              </p>
            </>
          )}
        </MetricCard>

        <MetricCard title="IMC atual">
          <p className="text-3xl font-bold tracking-tight">
            {formatNumber(data.bmi.value)}
          </p>
          <span
            className={`mt-4 inline-flex rounded-xl px-3 py-1.5 text-base font-semibold ${data.bmi.category === "normal" ? "bg-accent/20 text-green-300" : "bg-input text-muted-foreground"}`}
          >
            {bmiLabels[data.bmi.category]}
          </span>
        </MetricCard>

        <MetricCard title="Frequência de treino">
          <p className="text-3xl font-bold tracking-tight">—</p>
          <p className="mt-3 text-muted-foreground">
            <span className="mr-2 text-green-400">◉</span>Meta:{" "}
            {data.training.goalPerWeek}× por semana
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Registro de treinos em breve
          </p>
        </MetricCard>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
        <WeightChart data={data.weightSeries} targetKg={data.weight.targetKg} />
        <BodyMeasuresChart data={data.measurementSeries} />
      </div>

      <HistoryTable items={data.history} />
      {measurementOpen && (
        <MeasurementDialog
          weightKg={data.weight.currentKg}
          chestCm={lastMeasurement?.chestCm ?? null}
          waistCm={lastMeasurement?.waistCm ?? null}
          hipCm={lastMeasurement?.hipCm ?? null}
          onClose={() => setMeasurementOpen(false)}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/_auth/")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(dashboardQueryOptions);
    } catch (error) {
      if ((error as { status?: number }).status === 404)
        throw redirect({ to: "/profile/setup" });
    }
  },
  component: DashboardPage,
});
