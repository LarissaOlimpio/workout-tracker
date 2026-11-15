import type { ReactNode } from "react";

export function MetricCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground sm:text-base">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
