"use client";

import { motion } from "framer-motion";

export function CompareBar({
  label,
  away,
  home,
  awayColor,
  homeColor,
  decimals = 0,
  suffix = "",
}: {
  label: string;
  away: number;
  home: number;
  awayColor: string;
  homeColor: string;
  decimals?: number;
  suffix?: string;
}) {
  const total = away + home || 1;
  const awayPct = (away / total) * 100;
  const homePct = 100 - awayPct;
  const awayWins = away > home;

  const fmt = (n: number) => n.toFixed(decimals) + suffix;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className={`stat-num font-semibold ${awayWins ? "text-fg" : "text-muted"}`}>
          {fmt(away)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-faint">{label}</span>
        <span className={`stat-num font-semibold ${!awayWins ? "text-fg" : "text-muted"}`}>
          {fmt(home)}
        </span>
      </div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        <motion.div
          className="h-full rounded-l-full"
          style={{ background: awayColor, opacity: awayWins ? 1 : 0.55 }}
          initial={{ width: 0 }}
          whileInView={{ width: `${awayPct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
        />
        <motion.div
          className="h-full rounded-r-full"
          style={{ background: homeColor, opacity: !awayWins ? 1 : 0.55 }}
          initial={{ width: 0 }}
          whileInView={{ width: `${homePct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
