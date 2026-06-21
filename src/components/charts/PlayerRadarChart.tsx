"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export interface RadarPoint {
  stat: string;
  value: number; // 0-100 normalized
}

export function PlayerRadarChart({ data }: { data: RadarPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#242838" />
          <PolarAngleAxis dataKey="stat" tick={{ fill: "#99a0b4", fontSize: 12 }} />
          <Radar
            dataKey="value"
            stroke="#ff6a1a"
            strokeWidth={2}
            fill="#ff6a1a"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
