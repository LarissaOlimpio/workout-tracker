import type { ReactNode } from "react";

export function MetricCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-base font-semibold uppercase tracking-wide text-foreground sm:text-lg">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
