"use client";

import { useRouter } from "next/navigation";
import type { ItemWithRelations } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemForm } from "@/components/items/item-form";
import { useTaxonomy } from "@/components/app/taxonomy-context";

export function EditItemDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ItemWithRelations;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const { categories, projects, tags } = useTaxonomy();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar item</DialogTitle>
        </DialogHeader>
        <ItemForm
          mode="edit"
          item={item}
          categories={categories}
          projects={projects}
          tagSuggestions={tags.map((t) => t.name)}
          onDone={() => {
            onOpenChange(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
