"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus, Tag as TagIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createTag, deleteTag, updateTag } from "@/lib/actions/taxonomy";
import { TAG_COLORS } from "@/lib/constants";
import { colorFromString } from "@/lib/utils";
import type { Tag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function ColorDot({
  color,
  onPick,
}: {
  color: string;
  onPick: (c: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="size-5 shrink-0 rounded-full border"
          style={{ backgroundColor: color }}
          aria-label="Escolher cor"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-8 gap-1">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onPick(c)}
              className="grid size-6 place-items-center rounded-full"
              style={{ backgroundColor: c }}
            >
              {c === color && <Check className="size-3.5 text-white" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TagManager({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();

  const add = () => {
    const value = name.trim();
    if (!value) return;
    start(async () => {
      const r = await createTag({ name: value, color: colorFromString(value) });
      if (r.ok) {
        setName("");
        router.refresh();
      } else toast.error(r.error);
    });
  };

  const rename = (tag: Tag, newName: string) => {
    if (newName.trim() && newName !== tag.name) {
      start(async () => {
        const r = await updateTag(tag.id, { name: newName.trim() });
        if (r.ok) router.refresh();
        else toast.error(r.error);
      });
    }
  };

  const recolor = (tag: Tag, color: string) => {
    start(async () => {
      const r = await updateTag(tag.id, { color });
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nova tag…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Button onClick={add} disabled={pending || !name.trim()}>
          <Plus className="size-4" />
          Criar
        </Button>
      </div>

      {tags.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="Nenhuma tag ainda"
          description="Crie tags para cruzar assuntos entre categorias e projetos."
        />
      ) : (
        <ul className="divide-y rounded-xl border">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center gap-3 px-3 py-2.5">
              <ColorDot color={tag.color} onPick={(c) => recolor(tag, c)} />
              <input
                defaultValue={tag.name}
                onBlur={(e) => rename(tag, e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.target as HTMLInputElement).blur()
                }
                className="flex-1 bg-transparent text-sm font-medium outline-none focus:underline"
              />
              <Link
                href={`/tags/${tag.id}`}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {tag.item_count ?? 0} {tag.item_count === 1 ? "item" : "itens"}
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteId(tag.id)}
                aria-label="Excluir tag"
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
        title="Excluir tag?"
        description="A tag será removida de todos os itens associados. Os itens não são apagados."
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          if (!deleteId) return;
          const r = await deleteTag(deleteId);
          if (r.ok) {
            toast.success("Tag excluída");
            router.refresh();
          } else toast.error(r.error);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
