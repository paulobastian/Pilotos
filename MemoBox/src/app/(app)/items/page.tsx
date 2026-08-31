import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ItemCollection } from "@/components/items/item-collection";
import { AddItemButton } from "@/components/items/add-buttons";

export const metadata: Metadata = { title: "Todos os itens" };

export default async function ItemsPage({ searchParams }: PageProps<"/items">) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader
        title="Todos os itens"
        description="Sua biblioteca completa, exceto arquivados e lixeira."
        action={<AddItemButton />}
      />
      <ItemCollection
        searchParams={sp}
        baseFilters={{ excludeStatuses: ["archived"] }}
        emptyTitle="Você ainda não salvou nada"
        emptyDescription="Comece adicionando um link, uma ideia ou uma ferramenta que você não quer esquecer."
      />
    </>
  );
}
