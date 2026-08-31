import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ItemCollection } from "@/components/items/item-collection";
import { EmptyTrashButton } from "@/components/items/empty-trash-button";

export const metadata: Metadata = { title: "Lixeira" };

export default async function TrashPage({ searchParams }: PageProps<"/trash">) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader
        title="Lixeira"
        description="Itens removidos. Restaure ou exclua definitivamente."
        action={<EmptyTrashButton />}
      />
      <ItemCollection
        searchParams={sp}
        baseFilters={{ deleted: true }}
        showFilters={false}
        emptyTitle="Lixeira vazia"
      />
    </>
  );
}
