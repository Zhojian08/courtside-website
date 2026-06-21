"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  label: string;
  pts: number;
  reb: number;
  ast: number;
}

export function PlayerTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="ptsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6a1a" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#ff6a1a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#222634" vertical={false} />
          <XAxis dataKey="label" stroke="#5c6377" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#5c6377" fontSize={12} tickLine={false} axisLine={false} width={34} />
          <Tooltip
            cursor={{ stroke: "#333", strokeWidth: 1 }}
            contentStyle={{
              background: "#11131c",
              border: "1px solid #242838",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#99a0b4" }}
          />
          <Area type="monotone" dataKey="pts" name="PTS" stroke="#ff6a1a" strokeWidth={2.5} fill="url(#ptsFill)" />
          <Line type="monotone" dataKey="reb" name="REB" stroke="#3d7bff" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ast" name="AST" stroke="#2fd27a" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
