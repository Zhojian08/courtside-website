"use client";

import { CountUp } from "@/components/ui/CountUp";

export function StatStrip({
  stats,
}: {
  stats: { label: string; value: number; suffix?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="card p-5 text-center">
          <div className="font-display text-4xl text-accent sm:text-5xl">
            <CountUp to={s.value} suffix={s.suffix} />
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-faint">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
