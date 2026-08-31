import type { Metadata } from "next";
import Link from "next/link";
import { History as HistoryIcon } from "lucide-react";
import { getRecentlyAccessed } from "@/lib/queries";
import { ITEM_TYPE_MAP } from "@/lib/constants";
import { faviconFor, relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Recentemente acessados" };

export default async function HistoryPage() {
  const history = await getRecentlyAccessed(40);

  return (
    <>
      <PageHeader
        title="Recentemente acessados"
        description="Os links que você abriu, do mais recente para o mais antigo."
      />

      {history.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="Nenhum acesso registrado"
          description="Quando você abrir o link de um item, ele aparece aqui."
        />
      ) : (
        <ul className="divide-y rounded-xl border">
          {history.map(({ accessed_at, item }) => {
            const Icon = ITEM_TYPE_MAP[item.type].icon;
            const favicon = item.favicon ?? faviconFor(item.domain);
            return (
              <li key={item.id}>
                <Link
                  href={`/items/${item.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/40"
                >
                  <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                    {favicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={favicon} alt="" className="size-4 rounded-sm" />
                    ) : Icon ? (
                      <Icon className="size-4" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.domain ?? ITEM_TYPE_MAP[item.type].label}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {relativeTime(accessed_at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
