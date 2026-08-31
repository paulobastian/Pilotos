import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ItemCollection } from "@/components/items/item-collection";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: PageProps<"/inbox">) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader
        title="Inbox"
        description="Capturado, ainda não organizado. Adicione categoria, tags e uma nota — depois arquive ou mova de status."
      />
      <ItemCollection
        searchParams={sp}
        baseFilters={{ statuses: ["inbox"] }}
        showFilters={false}
        emptyTitle="Inbox vazia"
        emptyDescription="Tudo o que você capturar rapidamente aparece aqui até ser organizado."
      />
    </>
  );
}
