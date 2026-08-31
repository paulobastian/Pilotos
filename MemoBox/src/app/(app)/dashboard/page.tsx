import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  FolderKanban,
  Inbox,
  Lightbulb,
  Link2,
  ListChecks,
  Sparkles,
  Star,
} from "lucide-react";
import { getDashboardCounts, getItems, getProfile } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/empty-state";
import { AddFirstItemButton, AddItemButton } from "@/components/items/add-buttons";
import { ItemCard } from "@/components/items/item-card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [counts, profile, recent, unopened] = await Promise.all([
    getDashboardCounts(),
    getProfile(),
    getItems({ excludeStatuses: ["archived"], sort: "recent", pageSize: 6 }),
    getItems({ unopened: true, excludeStatuses: ["archived"], sort: "recent", pageSize: 6 }),
  ]);

  const name = profile?.name?.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

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
      <PageHeader
        title={`${greeting}${name ? `, ${name}` : ""}`}
        description="Visão geral da sua biblioteca."
        action={<AddItemButton />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total de itens" value={counts.all} icon={ListChecks} href="/items" />
        <StatCard
          label="Não organizados"
          value={counts.inbox}
          icon={Inbox}
          href="/inbox"
          hint={counts.inbox > 0 ? "esperando na Inbox" : "tudo em dia"}
        />
        <StatCard label="Favoritos" value={counts.favorites} icon={Star} href="/favorites" />
        <StatCard
          label="Não abertos"
          value={counts.unopened}
          icon={Compass}
          href="/items?sort=recent"
        />
        <StatCard label="Ideias" value={counts.idea} icon={Lightbulb} href="/type/idea" />
        <StatCard label="Links" value={counts.link} icon={Link2} href="/type/link" />
        <StatCard label="Projetos" value={counts.projects} icon={FolderKanban} href="/projects" />
        <StatCard label="Arquivados" value={counts.archived} icon={ListChecks} href="/archived" />
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
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Continue explorando</h2>
            <span className="text-sm text-muted-foreground">
              itens que você salvou mas ainda não abriu
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
