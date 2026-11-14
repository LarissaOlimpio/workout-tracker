import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { BodyMeasuresChart, WeightChart } from "../../features/dashboard/DashboardCharts";
import { MeasurementDialog } from "../../features/dashboard/MeasurementDialog";
import { MetricCard } from "../../features/dashboard/MetricCard";
import { dashboardQueryOptions, type DashboardData } from "../../features/dashboard/dashboard-api";
import { formatFullDate, formatNumber } from "../../features/dashboard/format";

const bmiLabels = {
  underweight: "Abaixo do peso",
  normal: "Peso normal",
  overweight: "Sobrepeso",
  obese: "Obesidade",
} as const;

function HistoryTable({ items }: { items: DashboardData["history"] }) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
      <h2 className="text-xl font-bold sm:text-2xl">Histórico de Medições</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-base font-semibold sm:text-lg">
              <th className="px-2 py-3">Data</th>
              <th className="px-2 py-3">Peso</th>
              <th className="px-2 py-3">Peito</th>
              <th className="px-2 py-3">Cintura</th>
              <th className="px-2 py-3">Quadril</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.date} className="border-b border-border last:border-0">
                <td className="px-2 py-3">{formatFullDate(item.date)}</td>
                <td className="px-2 py-3">{formatNumber(item.weightKg)} kg</td>
                <td className="px-2 py-3">{item.chestCm == null ? "—" : `${formatNumber(item.chestCm)} cm`}</td>
                <td className="px-2 py-3">{item.waistCm == null ? "—" : `${formatNumber(item.waistCm)} cm`}</td>
                <td className="px-2 py-3">{item.hipCm == null ? "—" : `${formatNumber(item.hipCm)} cm`}</td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Nenhuma medição registrada.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DashboardPage() {
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const { data, isPending, isError } = useQuery(dashboardQueryOptions);
  if (isPending) return <div className="py-20 text-center text-muted-foreground">Carregando seu dashboard...</div>;
  if (isError || !data) return <div role="alert" className="py-20 text-center text-danger">Não foi possível carregar o dashboard. Tente novamente.</div>;

  const variationGood = (data.goal === "lose_weight" && data.weight.deltaKg < 0) ||
    (data.goal === "gain_muscle" && data.weight.deltaKg > 0);
  const lastMeasurement = data.history[0];
  const weightDelta = data.weight.deltaKg > 0 ? `+${formatNumber(data.weight.deltaKg)}` : formatNumber(data.weight.deltaKg);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Dashboard de Evolução</h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-xl">Acompanhe o progresso do seu peso e medidas corporais.</p>
        </div>
        <button type="button" onClick={() => setMeasurementOpen(true)} className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition-colors hover:bg-primary-hover sm:px-8 sm:py-4 sm:text-lg">
          <Plus aria-hidden="true" size={24} /> Registrar medição
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard title="Peso atual">
          <div className="flex items-center justify-between gap-3">
            <p className="text-4xl font-bold tracking-tight sm:text-5xl">{formatNumber(data.weight.currentKg)} kg</p>
            {data.weight.deltaKg !== 0 && <span className={`shrink-0 rounded-xl px-3 py-1.5 text-base font-semibold ${variationGood ? "bg-accent/20 text-green-300" : "bg-input text-muted-foreground"}`}>{weightDelta} kg</span>}
          </div>
          {data.weight.targetKg !== null && (
            <>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-input"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, data.weight.progressPct ?? 0))}%` }} /></div>
              <p className="mt-3 text-muted-foreground"><span className="mr-2 text-primary">◉</span>Meta: {formatNumber(data.weight.targetKg)} kg</p>
            </>
          )}
        </MetricCard>

        <MetricCard title="IMC atual">
          <p className="text-4xl font-bold tracking-tight sm:text-5xl">{formatNumber(data.bmi.value)}</p>
          <span className={`mt-4 inline-flex rounded-xl px-3 py-1.5 text-base font-semibold ${data.bmi.category === "normal" ? "bg-accent/20 text-green-300" : "bg-input text-muted-foreground"}`}>{bmiLabels[data.bmi.category]}</span>
        </MetricCard>

        <MetricCard title="Frequência de treino">
          <p className="text-4xl font-bold tracking-tight sm:text-5xl">—</p>
          <p className="mt-3 text-muted-foreground"><span className="mr-2 text-green-400">◉</span>Meta: {data.training.goalPerWeek}× por semana</p>
          <p className="mt-2 text-sm text-muted-foreground">Registro de treinos em breve</p>
        </MetricCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <WeightChart data={data.weightSeries} targetKg={data.weight.targetKg} />
        <BodyMeasuresChart data={data.measurementSeries} />
      </div>

      <HistoryTable items={data.history} />
      {measurementOpen && <MeasurementDialog weightKg={data.weight.currentKg} chestCm={lastMeasurement?.chestCm ?? null} waistCm={lastMeasurement?.waistCm ?? null} hipCm={lastMeasurement?.hipCm ?? null} onClose={() => setMeasurementOpen(false)} />}
    </div>
  );
}

export const Route = createFileRoute("/_auth/")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(dashboardQueryOptions);
    } catch (error) {
      if ((error as { status?: number }).status === 404) throw redirect({ to: "/profile/setup" });
    }
  },
  component: DashboardPage,
});
