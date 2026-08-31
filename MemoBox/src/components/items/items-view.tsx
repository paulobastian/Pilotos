"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import {
  ITEM_STATUSES,
  ITEM_TYPES,
} from "@/lib/constants";
import { useViewMode } from "@/lib/hooks";
import type { Category, ItemWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ItemCard, ItemRow } from "@/components/items/item-card";

const SORTS = [
  { value: "recent", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "title", label: "Título (A-Z)" },
  { value: "updated", label: "Atualizados" },
];

function useSetParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === "") params.delete(k);
        else params.set(k, v);
      }
      if ("page" in updates === false) params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );
}

export function ItemsToolbar({
  categories,
  showFilters = true,
  total,
}: {
  categories: Category[];
  showFilters?: boolean;
  total: number;
}) {
  const [view, setView] = useViewMode();
  const searchParams = useSearchParams();
  const setParams = useSetParams();

  const sort = searchParams.get("sort") ?? "recent";
  const type = searchParams.get("type") ?? "";
  const status = searchParams.get("status") ?? "";
  const category = searchParams.get("category") ?? "";
  const activeFilters = [type, status, category].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {total} {total === 1 ? "item" : "itens"}
      </span>
      <div className="ml-auto flex items-center gap-2">
        {showFilters && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="size-4" />
                Filtros
                {activeFilters > 0 && (
                  <span className="ml-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-3">
              <FilterSelect
                label="Tipo"
                value={type}
                onChange={(v) => setParams({ type: v })}
                options={ITEM_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              />
              <FilterSelect
                label="Status"
                value={status}
                onChange={(v) => setParams({ status: v })}
                options={ITEM_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              />
              <FilterSelect
                label="Categoria"
                value={category}
                onChange={(v) => setParams({ category: v })}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setParams({ type: null, status: null, category: null })}
                >
                  Limpar filtros
                </Button>
              )}
            </PopoverContent>
          </Popover>
        )}

        <Select value={sort} onValueChange={(v) => setParams({ sort: v })}>
          <SelectTrigger className="h-8 w-[150px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex rounded-md border p-0.5">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "grid size-7 place-items-center rounded",
              view === "grid" ? "bg-accent text-foreground" : "text-muted-foreground",
            )}
            aria-label="Grade"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "grid size-7 place-items-center rounded",
              view === "list" ? "bg-accent text-foreground" : "text-muted-foreground",
            )}
            aria-label="Lista"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? null : v)}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ItemsGrid({ items }: { items: ItemWithRelations[] }) {
  const [view] = useViewMode();
  if (view === "list") {
    return (
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        asChild={page > 1}
      >
        {page > 1 ? <Link href={href(page - 1)}>Anterior</Link> : <span>Anterior</span>}
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {page} de {pages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= pages} asChild={page < pages}>
        {page < pages ? <Link href={href(page + 1)}>Próxima</Link> : <span>Próxima</span>}
      </Button>
    </div>
  );
}
