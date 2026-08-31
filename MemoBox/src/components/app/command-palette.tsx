"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Plus,
  Star,
  FileText,
} from "lucide-react";
import { ITEM_TYPE_MAP } from "@/lib/constants";
import { useDebounce } from "@/lib/hooks";
import type { ItemType } from "@/lib/types";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAppUI } from "@/components/app/ui-context";

type Hit = {
  id: string;
  title: string;
  domain: string | null;
  favicon: string | null;
  type: ItemType;
};

const QUICK_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Todos os itens", href: "/items", icon: ListChecks },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Favoritos", href: "/favorites", icon: Star },
];

export function CommandPalette() {
  const router = useRouter();
  const { searchOpen, setSearchOpen, openAdd } = useAppUI();
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debounced = useDebounce(query, 200);

  React.useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  React.useEffect(() => {
    const term = debounced.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setHits(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debounced]);

  const go = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  const trimmed = query.trim();

  return (
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
      <CommandInput
        placeholder="Buscar itens, ou digitar um comando…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Buscando…" : "Nenhum resultado."}
        </CommandEmpty>

        {trimmed.length > 0 && (
          <CommandGroup heading="Ações">
            <CommandItem
              value={`__add ${trimmed}`}
              onSelect={() => {
                setSearchOpen(false);
                openAdd(trimmed);
              }}
            >
              <Plus />
              Adicionar “{trimmed}”
            </CommandItem>
            <CommandItem
              value={`__search ${trimmed}`}
              onSelect={() => go(`/search?q=${encodeURIComponent(trimmed)}`)}
            >
              <ArrowRight />
              Ver todos os resultados para “{trimmed}”
            </CommandItem>
          </CommandGroup>
        )}

        {hits.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Itens">
              {hits.map((hit) => {
                const Icon = ITEM_TYPE_MAP[hit.type]?.icon ?? FileText;
                return (
                  <CommandItem
                    key={hit.id}
                    value={`item-${hit.id}-${hit.title}`}
                    onSelect={() => go(`/items/${hit.id}`)}
                  >
                    <Icon />
                    <span className="flex-1 truncate">{hit.title}</span>
                    {hit.domain && (
                      <span className="text-xs text-muted-foreground">{hit.domain}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Ir para">
          {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
            <CommandItem key={href} value={`nav ${label}`} onSelect={() => go(href)}>
              <Icon />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
