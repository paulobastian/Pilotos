import type { Metadata } from "next";
import { getStats } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import {
  MonthlyBreakdown,
  RankedList,
  TypeBreakdown,
} from "@/components/stats/charts";

export const metadata: Metadata = { title: "Estatísticas" };

export default async function StatsPage() {
  const stats = await getStats();

  const kpis = [
    { label: "Projetos", value: stats.totals.projects },
    { label: "Tags", value: stats.totals.tags },
    { label: "Categorias", value: stats.totals.categories },
    { label: "Domínios", value: stats.totals.domains },
  ];

  return (
    <>
      <PageHeader title="Estatísticas" description="Um retrato da sua biblioteca." />

      {/* Hero figure — the one number the page leads with. */}
      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">Itens na biblioteca</p>
        <p className="mt-1 text-5xl font-semibold leading-none">{stats.totals.items}</p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label}>
              <p className="text-2xl font-semibold leading-none">{k.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TypeBreakdown data={stats.byType} />
        <MonthlyBreakdown data={stats.byMonth} />

        <RankedList
          title="Tags mais usadas"
          emptyLabel="Nenhuma tag em uso."
          rows={stats.topTags.map((t) => ({
            key: t.name,
            label: t.name,
            count: t.count,
            color: t.color,
          }))}
        />
        <RankedList
          title="Categorias mais usadas"
          emptyLabel="Nenhuma categoria em uso."
          rows={stats.topCategories.map((c) => ({
            key: c.name,
            label: c.name,
            count: c.count,
            color: c.color,
          }))}
        />
        <RankedList
          title="Domínios mais salvos"
          emptyLabel="Nenhum link salvo ainda."
          rows={stats.topDomains.map((d) => ({
            key: d.domain,
            label: d.domain,
            count: d.count,
            href: `/search?q=${encodeURIComponent(d.domain)}`,
          }))}
        />
      </div>
    </>
  );
}
