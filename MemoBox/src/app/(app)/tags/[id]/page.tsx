import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTag } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { ItemCollection } from "@/components/items/item-collection";

export async function generateMetadata({
  params,
}: PageProps<"/tags/[id]">): Promise<Metadata> {
  const { id } = await params;
  const tag = await getTag(id);
  return { title: tag ? `#${tag.name}` : "Tag" };
}

export default async function TagDetailPage({
  params,
  searchParams,
}: PageProps<"/tags/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const tag = await getTag(id);
  if (!tag) notFound();

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ backgroundColor: tag.color }} />
            {tag.name}
          </span>
        }
        description="Itens marcados com esta tag."
      />
      <ItemCollection
        searchParams={sp}
        baseFilters={{ tagId: id }}
        showFilters={false}
        emptyTitle="Nenhum item com esta tag"
      />
    </>
  );
}
