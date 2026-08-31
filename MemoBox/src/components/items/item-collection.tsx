import { Inbox as InboxIcon } from "lucide-react";
import { getCategories, getItems, type ItemFilters } from "@/lib/queries";
import { PAGE_SIZE } from "@/lib/constants";
import { EmptyState } from "@/components/empty-state";
import { AddFirstItemButton } from "@/components/items/add-buttons";
import {
  ItemsGrid,
  ItemsToolbar,
  Pagination,
} from "@/components/items/items-view";
import type { ItemType, ItemStatus } from "@/lib/types";

type SearchParams = { [key: string]: string | string[] | undefined };

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}

/**
 * Shared list page: reads URL params (sort/type/status/category/page), merges
 * with the caller's base filters, fetches and renders the collection.
 */
export async function ItemCollection({
  searchParams,
  baseFilters = {},
  showFilters = true,
  emptyTitle = "Nada por aqui ainda",
  emptyDescription,
}: {
  searchParams: SearchParams;
  baseFilters?: ItemFilters;
  showFilters?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const categories = await getCategories();

  const page = Number(str(searchParams.page) ?? "1") || 1;
  const urlFilters: ItemFilters = {
    sort: (str(searchParams.sort) as ItemFilters["sort"]) ?? "recent",
    type: str(searchParams.type) as ItemType | undefined,
    categoryId: str(searchParams.category),
    search: str(searchParams.q),
  };
  const statusParam = str(searchParams.status) as ItemStatus | undefined;

  const filters: ItemFilters = {
    ...baseFilters,
    ...urlFilters,
    ...(statusParam ? { statuses: [statusParam] } : {}),
    page,
    pageSize: PAGE_SIZE,
  };

  const { items, total } = await getItems(filters);

  return (
    <div className="space-y-4">
      <ItemsToolbar categories={categories} showFilters={showFilters} total={total} />

      {items.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={<AddFirstItemButton />}
        />
      ) : (
        <>
          <ItemsGrid items={items} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
        </>
      )}
    </div>
  );
}
