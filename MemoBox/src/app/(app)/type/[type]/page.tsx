import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ITEM_TYPE_MAP } from "@/lib/constants";
import type { ItemType } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { ItemCollection } from "@/components/items/item-collection";
import { AddItemButton } from "@/components/items/add-buttons";

const LABELS: Record<ItemType, string> = {
  link: "Links",
  idea: "Ideias",
  article: "Artigos",
  video: "Vídeos",
  book: "Livros",
  course: "Cursos",
  tool: "Ferramentas",
  product: "Produtos",
  reference: "Referências",
  other: "Outros",
};

export async function generateMetadata({
  params,
}: PageProps<"/type/[type]">): Promise<Metadata> {
  const { type } = await params;
  return { title: LABELS[type as ItemType] ?? "Itens" };
}

export default async function TypePage({
  params,
  searchParams,
}: PageProps<"/type/[type]">) {
  const { type } = await params;
  const sp = await searchParams;
  if (!(type in ITEM_TYPE_MAP)) notFound();

  return (
    <>
      <PageHeader
        title={LABELS[type as ItemType]}
        action={<AddItemButton />}
      />
      <ItemCollection
        searchParams={sp}
        baseFilters={{ type: type as ItemType, excludeStatuses: ["archived"] }}
        showFilters={false}
        emptyTitle={`Nenhum item do tipo "${LABELS[type as ItemType]}"`}
      />
    </>
  );
}
