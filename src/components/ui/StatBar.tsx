"use client";

import { motion } from "framer-motion";

export function StatBar({
  label,
  value,
  max,
  suffix = "",
  color = "var(--color-accent)",
  decimals = 1,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  color?: string;
  decimals?: number;
}) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="stat-num font-semibold text-fg">
          {value.toFixed(decimals)}
          {suffix}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
