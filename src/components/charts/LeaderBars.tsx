"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export interface LeaderBar {
  name: string;
  value: number;
  highlight?: boolean;
}

export function LeaderBars({ data, unit = "" }: { data: LeaderBar[]; unit?: string }) {
  return (
    <div className="w-full" style={{ height: data.length * 46 + 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 44, bottom: 0, left: 8 }}
          barCategoryGap={10}
        >
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="name"
            width={128}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#cdd2e0", fontSize: 13 }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} background={{ fill: "#181b27", radius: 8 }}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.highlight ? "#ff6a1a" : "#3a4256"} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value) => `${Number(value).toFixed(1)}${unit}`}
              fill="#f3f5fa"
              fontSize={13}
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
