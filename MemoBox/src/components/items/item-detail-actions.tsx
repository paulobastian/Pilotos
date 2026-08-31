"use client";

import * as React from "react";
import { ExternalLink, Pencil } from "lucide-react";
import type { ItemWithRelations } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  FavoriteButton,
  ItemActionsMenu,
  useOpenLink,
} from "@/components/items/item-actions";
import { EditItemDialog } from "@/components/items/edit-item-dialog";
import { useHotkey } from "@/lib/hooks";

export function ItemDetailActions({ item }: { item: ItemWithRelations }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const openLink = useOpenLink();

  useHotkey("e", () => setEditOpen(true));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {item.url && (
        <Button onClick={() => openLink(item)}>
          <ExternalLink className="size-4" />
          Abrir link
        </Button>
      )}
      <Button variant="outline" onClick={() => setEditOpen(true)}>
        <Pencil className="size-4" />
        Editar
      </Button>
      <FavoriteButton item={item} className="border" />
      <ItemActionsMenu item={item} onEditShortcut={() => setEditOpen(true)} />

      <EditItemDialog item={item} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
