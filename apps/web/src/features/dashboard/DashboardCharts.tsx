import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardData } from "./dashboard-api";
import { formatNumber, formatShortDate } from "./format";

const colors = { chestCm: "#ff6a32", waistCm: "#79a7e1", hipCm: "#c77bd1" };
const names = { chestCm: "Peito", waistCm: "Cintura", hipCm: "Quadril" };
type MeasureKey = keyof typeof colors;

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-sm shadow-xl">
      <p className="mb-1 text-muted-foreground">{label ? formatShortDate(label) : ""}</p>
      {payload.filter((item) => item.value != null).map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.dataKey === "weightKg" ? "Peso" : names[item.dataKey as MeasureKey]}: {formatNumber(Number(item.value))} {item.dataKey === "weightKg" ? "kg" : "cm"}
        </p>
      ))}
    </div>
  );
}

export function WeightChart({ data, targetKg }: { data: DashboardData["weightSeries"]; targetKg: number | null }) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-xl font-bold sm:text-2xl">Evolução do Peso Corporal</h2>
      <div className="mt-2 h-40 lg:min-h-0 lg:flex-1">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 18, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5a1f" stopOpacity={0.42} />
                  <stop offset="100%" stopColor="#ff5a1f" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#414a49" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#9aa3a1" tickLine={false} axisLine={false} />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} stroke="#9aa3a1" tickLine={false} axisLine={false} width={45} />
              <Tooltip content={<ChartTooltip />} />
              {targetKg !== null && <ReferenceLine y={targetKg} stroke="#d7d9d8" strokeDasharray="6 6" label={{ value: `Meta: ${formatNumber(targetKg)} kg`, fill: "#d7d9d8", position: "insideTopRight" }} />}
              <Area type="monotone" dataKey="weightKg" stroke="#ff5a1f" strokeWidth={3} fill="url(#weightGradient)" activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <div className="flex h-full items-center justify-center text-muted-foreground">Ainda não há dados de peso.</div>}
      </div>
    </section>
  );
}

export function BodyMeasuresChart({ data }: { data: DashboardData["measurementSeries"] }) {
  const [active, setActive] = useState<Record<MeasureKey, boolean>>({ chestCm: true, waistCm: true, hipCm: true });
  const available = (Object.keys(colors) as MeasureKey[]).filter((key) => data.some((item) => item[key] !== null));
  const last = (key: MeasureKey) => [...data].reverse().find((item) => item[key] !== null)?.[key] ?? null;
  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-xl font-bold sm:text-2xl">Medidas Corporais</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {available.map((key) => (
          <button key={key} type="button" aria-pressed={active[key]} onClick={() => setActive({ ...active, [key]: !active[key] })} className="min-h-10 rounded-full border px-3 py-1 text-xs font-medium transition-opacity sm:text-sm" style={{ borderColor: colors[key], color: colors[key], opacity: active[key] ? 1 : 0.45, background: active[key] ? `${colors[key]}18` : "transparent" }}>
            {names[key]} ({formatNumber(last(key)!)} cm)
          </button>
        ))}
      </div>
      <div className="mt-1 h-40 lg:min-h-0 lg:flex-1">
        {available.length && data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#414a49" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#9aa3a1" tickLine={false} axisLine={false} />
              <YAxis domain={["dataMin - 5", "dataMax + 5"]} stroke="#9aa3a1" tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} />
              {available.filter((key) => active[key]).map((key) => <Line key={key} type="monotone" dataKey={key} name={names[key]} stroke={colors[key]} strokeWidth={2.5} connectNulls dot={false} activeDot={{ r: 4 }} />)}
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="flex h-full items-center justify-center text-muted-foreground">Ainda não há medidas registradas.</div>}
      </div>
    </section>
  );
}
