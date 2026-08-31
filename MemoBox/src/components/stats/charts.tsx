"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ITEM_TYPE_MAP } from "@/lib/constants";
import type { Stats } from "@/lib/queries";

const PIE_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#22c55e",
  "#14b8a6", "#eab308", "#ef4444", "#6366f1", "#64748b",
];

export function TypePie({ data }: { data: Stats["byType"] }) {
  const chart = data.map((d) => ({
    name: ITEM_TYPE_MAP[d.type]?.label ?? d.type,
    value: d.count,
  }));
  if (chart.length === 0) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chart}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {chart.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBar({ data }: { data: Stats["byMonth"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} width={28} />
        <Tooltip
          cursor={{ fill: "var(--accent)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return (
    <div className="grid h-[240px] place-items-center text-sm text-muted-foreground">
      Sem dados ainda
    </div>
  );
}
