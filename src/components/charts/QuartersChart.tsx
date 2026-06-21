"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface QuarterDatum {
  q: string;
  [team: string]: string | number;
}

export function QuartersChart({
  data,
  awayKey,
  homeKey,
  awayColor,
  homeColor,
}: {
  data: QuarterDatum[];
  awayKey: string;
  homeKey: string;
  awayColor: string;
  homeColor: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} barGap={4}>
          <CartesianGrid stroke="#222634" vertical={false} />
          <XAxis dataKey="q" stroke="#5c6377" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#5c6377" fontSize={12} tickLine={false} axisLine={false} width={32} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "#11131c",
              border: "1px solid #242838",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={awayKey} fill={awayColor} radius={[4, 4, 0, 0]} maxBarSize={34} />
          <Bar dataKey={homeKey} fill={homeColor} radius={[4, 4, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
