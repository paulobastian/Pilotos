"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  archiveItem,
  deleteItemPermanently,
  duplicateItem,
  recordAccess,
  restoreItem,
  toggleFavorite,
  trashItem,
  unarchiveItem,
} from "@/lib/actions/items";
import type { ItemWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EditItemDialog } from "@/components/items/edit-item-dialog";
import { useHotkey } from "@/lib/hooks";

/** Open an item's URL, recording the access in the background. */
export function useOpenLink() {
  return React.useCallback((item: Pick<ItemWithRelations, "id" | "url">) => {
    if (!item.url) return;
    window.open(item.url, "_blank", "noopener,noreferrer");
    void recordAccess(item.id);
  }, []);
}

export function FavoriteButton({
  item,
  className,
}: {
  item: Pick<ItemWithRelations, "id" | "is_favorite">;
  className?: string;
}) {
  const [fav, setFav] = React.useState(item.is_favorite);
  const [pending, start] = React.useTransition();

  const toggle = () => {
    const next = !fav;
    setFav(next);
    start(async () => {
      const r = await toggleFavorite(item.id, next);
      if (!r.ok) {
        setFav(!next);
        toast.error(r.error);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      disabled={pending}
      aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={className}
    >
      <Star
        className={cn(
          "size-4 transition-colors",
          fav ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
        )}
      />
    </Button>
  );
}

export function ItemActionsMenu({
  item,
  onEditShortcut,
  withHotkeys = false,
}: {
  item: ItemWithRelations;
  onEditShortcut?: () => void;
  withHotkeys?: boolean;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmTrash, setConfirmTrash] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const openLink = useOpenLink();
  const inTrash = !!item.deleted_at;
  const archived = item.status === "archived";

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) => {
    const r = await fn();
    if (r.ok) {
      toast.success(msg);
      router.refresh();
    } else {
      toast.error(r.error ?? "Erro");
    }
  };

  useHotkey("e", () => (onEditShortcut ? onEditShortcut() : setEditOpen(true)), {
    enabled: withHotkeys,
  });
  useHotkey("f", () => void run(() => toggleFavorite(item.id, !item.is_favorite), "Atualizado"), {
    enabled: withHotkeys,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Ações">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {item.url && (
            <DropdownMenuItem onClick={() => openLink(item)}>
              <ExternalLink /> Abrir link
            </DropdownMenuItem>
          )}
          {!inTrash && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil /> Editar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => run(() => duplicateItem(item.id), "Item duplicado")}
          >
            <Copy /> Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {inTrash ? (
            <>
              <DropdownMenuItem
                onClick={() => run(() => restoreItem(item.id), "Item restaurado")}
              >
                <RotateCcw /> Restaurar
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 /> Excluir definitivamente
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {archived ? (
                <DropdownMenuItem
                  onClick={() => run(() => unarchiveItem(item.id), "Item desarquivado")}
                >
                  <ArchiveRestore /> Desarquivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => run(() => archiveItem(item.id), "Item arquivado")}
                >
                  <Archive /> Arquivar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmTrash(true)}>
                <Trash2 /> Mover para lixeira
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {editOpen && (
        <EditItemDialog item={item} open={editOpen} onOpenChange={setEditOpen} />
      )}

      <ConfirmDialog
        open={confirmTrash}
        onOpenChange={setConfirmTrash}
        title="Mover para a lixeira?"
        description="Você pode restaurar depois pela Lixeira."
        confirmLabel="Mover"
        destructive
        onConfirm={() => run(() => trashItem(item.id), "Movido para a lixeira")}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir definitivamente?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={() =>
          run(() => deleteItemPermanently(item.id), "Item excluído")
        }
      />
    </>
  );
}
