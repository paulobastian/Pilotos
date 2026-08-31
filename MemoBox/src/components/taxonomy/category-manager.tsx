"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, FolderPlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/taxonomy";
import { TAG_COLORS } from "@/lib/constants";
import { colorFromString } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();

  const add = () => {
    const value = name.trim();
    if (!value) return;
    start(async () => {
      const r = await createCategory({ name: value, color: colorFromString(value) });
      if (r.ok) {
        setName("");
        router.refresh();
      } else toast.error(r.error);
    });
  };

  const save = (cat: Category, patch: Partial<Category>) => {
    start(async () => {
      const r = await updateCategory(cat.id, patch);
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nova categoria…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Button onClick={add} disabled={pending || !name.trim()}>
          <Plus className="size-4" />
          Criar
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="Nenhuma categoria"
          description="Categorias são a divisão principal da sua biblioteca."
        />
      ) : (
        <ul className="divide-y rounded-xl border">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-3 px-3 py-2.5">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="size-5 shrink-0 rounded-full border"
                    style={{ backgroundColor: cat.color }}
                    aria-label="Cor"
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="grid grid-cols-8 gap-1">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => save(cat, { color: c })}
                        className="grid size-6 place-items-center rounded-full"
                        style={{ backgroundColor: c }}
                      >
                        {c === cat.color && <Check className="size-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <input
                defaultValue={cat.name}
                onBlur={(e) =>
                  e.target.value.trim() &&
                  e.target.value !== cat.name &&
                  save(cat, { name: e.target.value.trim() })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.target as HTMLInputElement).blur()
                }
                className="flex-1 bg-transparent text-sm font-medium outline-none focus:underline"
              />
              <span className="text-xs text-muted-foreground">
                {cat.item_count ?? 0} {cat.item_count === 1 ? "item" : "itens"}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteId(cat.id)}
                aria-label="Excluir categoria"
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Excluir categoria?"
        description="Os itens desta categoria ficam sem categoria, mas não são apagados."
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          if (!deleteId) return;
          const r = await deleteCategory(deleteId);
          if (r.ok) {
            toast.success("Categoria excluída");
            router.refresh();
          } else toast.error(r.error);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
