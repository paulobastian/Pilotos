import type { Metadata } from "next";
import { getTags } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { TagManager } from "@/components/taxonomy/tag-manager";

export const metadata: Metadata = { title: "Tags" };

export default async function TagsPage() {
  const tags = await getTags();
  return (
    <>
      <PageHeader
        title="Tags"
        description="Rótulos leves para cruzar assuntos. Clique numa tag para ver os itens."
      />
      <TagManager tags={tags} />
    </>
  );
}
