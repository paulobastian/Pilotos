import type { Metadata } from "next";
import { getCategories } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { CategoryManager } from "@/components/taxonomy/category-manager";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader
        title="Categorias"
        description="A divisão principal da sua biblioteca. Renomeie ou troque a cor a qualquer momento."
      />
      <CategoryManager categories={categories} />
    </>
  );
}
