"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ITEM_TYPE_MAP } from "@/lib/constants";
import { useMounted } from "@/lib/hooks";
import type { Stats } from "@/lib/queries";

/**
 * Chart colours come from the data-viz reference palette (validated for both
 * surfaces), not from the app's monochrome accent. Single-series charts use
 * categorical slot 1 (blue); values are always direct-labelled so the sub-3:1
 * relief rule is satisfied and a table view is offered besides.
 */
const LIGHT = { series: "#2a78d6", grid: "#e1e0d9", axis: "#898781", ink: "#52514e" };
const DARK = { series: "#3987e5", grid: "#2c2c2a", axis: "#898781", ink: "#c3c2b7" };

function useViz() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  return mounted && resolvedTheme === "dark" ? DARK : LIGHT;
}

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--popover-foreground)",
  boxShadow: "0 4px 16px rgb(0 0 0 / 0.08)",
  padding: "6px 10px",
};

/* --------------------------- switchable frame --------------------------- */

export function ChartFrame({
  title,
  chart,
  table,
  empty,
}: {
  title: string;
  chart: React.ReactNode;
  table: React.ReactNode;
  empty?: boolean;
}) {
  const [view, setView] = React.useState<"chart" | "table">("chart");

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <h3 className="text-sm font-medium">{title}</h3>
        {!empty && (
          <div className="flex rounded-md border p-0.5 text-xs">
            {(["chart", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={
                  "rounded px-2 py-0.5 transition-colors " +
                  (view === v
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {v === "chart" ? "Gráfico" : "Tabela"}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="p-4">
        {empty ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sem dados ainda.
          </p>
        ) : view === "chart" ? (
          chart
        ) : (
          table
        )}
      </div>
    </div>
  );
}

function DataTable({
  columns,
  rows,
}: {
  columns: [string, string];
  rows: { key: string; label: React.ReactNode; value: number }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-1.5 font-medium">{columns[0]}</th>
            <th className="pb-1.5 text-right font-medium">{columns[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b last:border-0">
              <td className="py-1.5">{r.label}</td>
              <td className="py-1.5 text-right tabular-nums">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ by type -------------------------------- */

export function TypeBreakdown({ data }: { data: Stats["byType"] }) {
  const viz = useViz();
  const rows = data.map((d) => ({
    key: d.type,
    label: ITEM_TYPE_MAP[d.type]?.label ?? d.type,
    count: d.count,
  }));

  return (
    <ChartFrame
      title="Itens por tipo"
      empty={rows.length === 0}
      table={
        <DataTable
          columns={["Tipo", "Itens"]}
          rows={rows.map((r) => ({ key: r.key, label: r.label, value: r.count }))}
        />
      }
      chart={
        <ResponsiveContainer width="100%" height={Math.max(120, rows.length * 34 + 8)}>
          <BarChart
            layout="vertical"
            data={rows}
            margin={{ top: 0, right: 28, bottom: 0, left: 0 }}
            barCategoryGap={8}
          >
            <CartesianGrid horizontal={false} stroke={viz.grid} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={92}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: viz.axis }}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.4 }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(v) => [`${v as number}`, "itens"]}
            />
            <Bar dataKey="count" fill={viz.series} radius={[0, 4, 4, 0]} barSize={18}>
              <LabelList
                dataKey="count"
                position="right"
                offset={8}
                style={{ fill: viz.ink, fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      }
    />
  );
}

/* --------------------------- added per month --------------------------- */

export function MonthlyBreakdown({ data }: { data: Stats["byMonth"] }) {
  const viz = useViz();
  const allZero = data.every((d) => d.count === 0);

  return (
    <ChartFrame
      title="Adicionados por mês"
      empty={allZero}
      table={
        <DataTable
          columns={["Mês", "Itens"]}
          rows={data.map((d, i) => ({ key: `${d.month}-${i}`, label: d.month, value: d.count }))}
        />
      }
      chart={
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 18, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid vertical={false} stroke={viz.grid} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: viz.grid }}
              tick={{ fontSize: 12, fill: viz.axis }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.4 }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(v) => [`${v as number}`, "itens"]}
            />
            <Bar dataKey="count" fill={viz.series} radius={[4, 4, 0, 0]} maxBarSize={28}>
              <LabelList
                dataKey="count"
                position="top"
                offset={6}
                style={{ fill: viz.ink, fontSize: 12 }}
                formatter={(v: React.ReactNode) => (v && v !== 0 ? String(v) : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      }
    />
  );
}

/* ---------------------- ranked list with inline bar -------------------- */

export function RankedList({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: {
    key: string;
    label: string;
    count: number;
    color?: string;
    href?: string;
  }[];
  emptyLabel: string;
}) {
  const viz = useViz();
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-4 py-2.5">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="space-y-2 p-4">
        {rows.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground">{emptyLabel}</p>
        )}
        {rows.map((r) => {
          const labelClass = "block w-28 shrink-0 truncate";
          return (
            <div key={r.key} className="flex items-center gap-3 text-sm">
              {r.color && (
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: r.color }}
                />
              )}
              {r.href ? (
                <Link
                  href={r.href}
                  className={labelClass + " hover:underline"}
                  title={r.label}
                >
                  {r.label}
                </Link>
              ) : (
                <span className={labelClass} title={r.label}>
                  {r.label}
                </span>
              )}
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${(r.count / max) * 100}%`,
                    backgroundColor: viz.series,
                  }}
                />
              </span>
              <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">
                {r.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
