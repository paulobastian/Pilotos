"use client";

import Link from "next/link";
import { ExternalLink, ImageOff } from "lucide-react";
import { ITEM_TYPE_MAP } from "@/lib/constants";
import type { ItemWithRelations } from "@/lib/types";
import { cn, faviconFor, relativeTime } from "@/lib/utils";
import { StatusBadge, TagChip, TypeBadge } from "@/components/items/badges";
import {
  FavoriteButton,
  ItemActionsMenu,
  useOpenLink,
} from "@/components/items/item-actions";

function Thumb({ item }: { item: ItemWithRelations }) {
  const Icon = ITEM_TYPE_MAP[item.type].icon ?? ImageOff;
  if (item.thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={item.thumbnail}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      {Icon && <Icon className="size-8" />}
    </div>
  );
}

export function ItemCard({ item }: { item: ItemWithRelations }) {
  const openLink = useOpenLink();
  const favicon = item.favicon ?? faviconFor(item.domain);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <Link
        href={`/items/${item.id}`}
        className="relative block aspect-[16/9] overflow-hidden border-b bg-muted"
      >
        <Thumb item={item} />
      </Link>

      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-background/85 p-0.5 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {item.url && (
          <button
            onClick={() => openLink(item)}
            className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Abrir link"
          >
            <ExternalLink className="size-4" />
          </button>
        )}
        <FavoriteButton item={item} />
        <ItemActionsMenu item={item} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="" className="size-3.5 rounded-sm" loading="lazy" />
          ) : null}
          <span className="truncate">{item.domain ?? "sem link"}</span>
        </div>

        <Link
          href={`/items/${item.id}`}
          className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
        >
          {item.title}
        </Link>

        {item.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        )}

        {item.personal_note && (
          <p className="line-clamp-2 rounded bg-muted/60 px-2 py-1 text-xs italic text-muted-foreground">
            {item.personal_note}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          <TypeBadge type={item.type} />
          {item.category && (
            <span
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              title="Categoria"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: item.category.color }}
              />
              {item.category.name}
            </span>
          )}
          {item.tags.slice(0, 3).map((t) => (
            <TagChip key={t.id} tag={t} href={`/tags/${t.id}`} />
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
          <StatusBadge status={item.status} />
          <span>{relativeTime(item.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

export function ItemRow({ item }: { item: ItemWithRelations }) {
  const openLink = useOpenLink();
  const favicon = item.favicon ?? faviconFor(item.domain);
  const Icon = ITEM_TYPE_MAP[item.type].icon;

  return (
    <div className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-accent/40">
      <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
        {favicon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={favicon} alt="" className="size-4 rounded-sm" loading="lazy" />
        ) : Icon ? (
          <Icon className="size-4" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/items/${item.id}`}
          className="block truncate text-sm font-medium hover:underline"
        >
          {item.title}
        </Link>
        <div className="flex items-center gap-2 truncate text-xs text-muted-foreground">
          <span>{ITEM_TYPE_MAP[item.type].label}</span>
          {item.category && (
            <>
              <span>·</span>
              <span>{item.category.name}</span>
            </>
          )}
          {item.domain && (
            <>
              <span>·</span>
              <span className="truncate">{item.domain}</span>
            </>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 md:flex">
        {item.tags.slice(0, 2).map((t) => (
          <TagChip key={t.id} tag={t} href={`/tags/${t.id}`} />
        ))}
      </div>

      <span className="hidden w-20 shrink-0 text-right text-xs text-muted-foreground sm:block">
        {relativeTime(item.created_at)}
      </span>

      <div className="flex shrink-0 items-center">
        {item.url && (
          <button
            onClick={() => openLink(item)}
            className="grid size-8 place-items-center rounded text-muted-foreground opacity-0 hover:bg-accent hover:text-foreground group-hover:opacity-100"
            aria-label="Abrir link"
          >
            <ExternalLink className="size-4" />
          </button>
        )}
        <FavoriteButton item={item} />
        <ItemActionsMenu item={item} />
      </div>
    </div>
  );
}
