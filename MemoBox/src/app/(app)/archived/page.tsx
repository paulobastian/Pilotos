import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ItemCollection } from "@/components/items/item-collection";

export const metadata: Metadata = { title: "Arquivados" };

export default async function ArchivedPage({
  searchParams,
}: PageProps<"/archived">) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader
        title="Arquivados"
        description="Itens que você já resolveu, mas quer manter guardados."
      />
      <ItemCollection
        searchParams={sp}
        baseFilters={{ statuses: ["archived"] }}
        showFilters={false}
        emptyTitle="Nada arquivado"
      />
    </>
  );
}
