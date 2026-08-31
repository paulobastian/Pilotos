import type { Metadata } from "next";
import { Suspense } from "react";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { SearchBox } from "@/components/search/search-box";
import { ItemCollection } from "@/components/items/item-collection";

export const metadata: Metadata = { title: "Busca" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";

  return (
    <>
      <PageHeader title="Busca" description="Encontre qualquer coisa que você salvou." />
      <div className="mb-6">
        <Suspense>
          <SearchBox />
        </Suspense>
      </div>

      {q.trim().length < 2 ? (
        <EmptyState
          icon={SearchIcon}
          title="Digite para buscar"
          description="A busca cobre título, descrição, nota pessoal e domínio. Use os filtros para refinar por tipo, status ou categoria."
        />
      ) : (
        <ItemCollection
          searchParams={sp}
          emptyTitle={`Nada encontrado para "${q}"`}
          emptyDescription="Tente outras palavras ou remova os filtros."
        />
      )}
    </>
  );
}
