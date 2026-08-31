import type { Metadata } from "next";
import Link from "next/link";
import { getStats } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyBar, TypePie } from "@/components/stats/charts";

export const metadata: Metadata = { title: "Estatísticas" };

export default async function StatsPage() {
  const stats = await getStats();

  const totals = [
    { label: "Itens", value: stats.totals.items },
    { label: "Projetos", value: stats.totals.projects },
    { label: "Tags", value: stats.totals.tags },
    { label: "Categorias", value: stats.totals.categories },
  ];

  return (
    <>
      <PageHeader title="Estatísticas" description="Um retrato da sua biblioteca." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {totals.map((t) => (
          <div key={t.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{t.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <TypePie data={stats.byType} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adicionados por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyBar data={stats.byMonth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags mais usadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.topTags.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma tag em uso.</p>
            )}
            {stats.topTags.map((t) => (
              <div key={t.name} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span className="flex-1 truncate">{t.name}</span>
                <span className="tabular-nums text-muted-foreground">{t.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Domínios mais salvos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.topDomains.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum link salvo ainda.</p>
            )}
            {stats.topDomains.map((d) => (
              <div key={d.domain} className="flex items-center gap-3 text-sm">
                <Link
                  href={`/search?q=${encodeURIComponent(d.domain)}`}
                  className="flex-1 truncate hover:underline"
                >
                  {d.domain}
                </Link>
                <span className="tabular-nums text-muted-foreground">{d.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorias mais usadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.topCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma categoria em uso.</p>
            )}
            {stats.topCategories.map((c) => (
              <div key={c.name} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="tabular-nums text-muted-foreground">{c.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
