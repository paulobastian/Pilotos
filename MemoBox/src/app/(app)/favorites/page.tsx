import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ItemCollection } from "@/components/items/item-collection";

export const metadata: Metadata = { title: "Favoritos" };

export default async function FavoritesPage({
  searchParams,
}: PageProps<"/favorites">) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader title="Favoritos" description="Os itens que você marcou com estrela." />
      <ItemCollection
        searchParams={sp}
        baseFilters={{ favorite: true }}
        emptyTitle="Nenhum favorito ainda"
        emptyDescription="Clique na estrela de qualquer item para guardá-lo aqui."
      />
    </>
  );
}
