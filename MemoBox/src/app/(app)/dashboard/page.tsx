import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  FolderKanban,
  Inbox,
  Sparkles,
  Star,
} from "lucide-react";
import { getDashboardCounts, getItems, getProfile } from "@/lib/queries";
import { pluralize } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/empty-state";
import { AddFirstItemButton } from "@/components/items/add-buttons";
import { ItemCard } from "@/components/items/item-card";

export const metadata: Metadata = { title: "Dashboard" };

function greetingFor(date = new Date()) {
  const h = date.getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default async function DashboardPage() {
  const [counts, profile, recent, unopened] = await Promise.all([
    getDashboardCounts(),
    getProfile(),
    getItems({ excludeStatuses: ["archived"], sort: "recent", pageSize: 6 }),
    getItems({ unopened: true, excludeStatuses: ["archived"], sort: "recent", pageSize: 6 }),
  ]);

  const name = profile?.name?.split(" ")[0];
  const greeting = greetingFor();

  if (counts.all === 0) {
    return (
      <>
        <PageHeader title={`${greeting}${name ? `, ${name}` : ""}`} />
        <EmptyState
          icon={Sparkles}
          title="Sua biblioteca está vazia"
          description="Salve o primeiro link, ideia ou ferramenta. Leva poucos segundos: cole a URL e pressione Enter."
          action={<AddFirstItemButton />}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title={`${greeting}${name ? `, ${name}` : ""}`} />

      {/* Hero figure — the one number the dashboard leads with. */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border bg-card p-6">
        <div>
          <p className="text-sm text-muted-foreground">Na sua biblioteca</p>
          <p className="mt-1 text-5xl font-semibold leading-none">
            {counts.all}
            <span className="ml-2 align-baseline text-base font-normal text-muted-foreground">
              {pluralize(counts.all, "item salvo", "itens salvos")}
            </span>
          </p>
        </div>
        {counts.inbox > 0 && (
          <Link
            href="/inbox"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 transition-colors hover:bg-amber-500/15 dark:text-amber-400"
          >
            {counts.inbox} {pluralize(counts.inbox, "item", "itens")} para organizar na Inbox →
          </Link>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Inbox" value={counts.inbox} icon={Inbox} href="/inbox" />
        <StatCard label="Favoritos" value={counts.favorites} icon={Star} href="/favorites" />
        <StatCard
          label="Ainda não abertos"
          value={counts.unopened}
          icon={Compass}
          href="/items"
        />
        <StatCard label="Projetos" value={counts.projects} icon={FolderKanban} href="/projects" />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Adicionados recentemente</h2>
          <Link href="/items" className="text-sm text-muted-foreground hover:text-foreground">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recent.items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {unopened.items.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-semibold">Continue explorando</h2>
            <span className="text-sm text-muted-foreground">
              salvos, mas você ainda não abriu
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unopened.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
