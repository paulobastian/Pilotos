"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { quickAddItem } from "@/lib/actions/items";
import { isValidUrl } from "@/lib/utils";
import type { Category, Project } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemForm } from "@/components/items/item-form";
import { useAppUI } from "@/components/app/ui-context";

export function AddItemDialog({
  categories,
  projects,
  tagSuggestions,
}: {
  categories: Category[];
  projects: Project[];
  tagSuggestions: string[];
}) {
  const router = useRouter();
  const { addOpen, setAddOpen, addPrefill } = useAppUI();
  const [mode, setMode] = React.useState<"quick" | "full">("quick");
  const [value, setValue] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (addOpen) {
      setValue(addPrefill ?? "");
      setMode("quick");
    }
  }, [addOpen, addPrefill]);

  const quickSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSaving(true);
    const result = await quickAddItem(trimmed);
    setSaving(false);
    if (result.ok) {
      toast.success(
        isValidUrl(trimmed) ? "Link salvo na Inbox" : "Ideia salva na Inbox",
        {
          action: result.data
            ? {
                label: "Abrir",
                onClick: () => router.push(`/items/${result.data!.id}`),
              }
            : undefined,
        },
      );
      setAddOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
      <DialogContent className={mode === "full" ? "sm:max-w-lg" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>Adicionar item</DialogTitle>
          <DialogDescription>
            {mode === "quick"
              ? "Cole um link e pressione Enter — organize depois."
              : "Preencha os detalhes agora."}
          </DialogDescription>
        </DialogHeader>

        {mode === "quick" ? (
          <div className="space-y-3">
            <Input
              autoFocus
              placeholder="https://…  ou escreva uma ideia"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  quickSave();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode("full")}
              >
                <SlidersHorizontal className="size-4" />
                Mais opções
              </Button>
              <Button type="button" onClick={quickSave} disabled={saving || !value.trim()}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <ItemForm
            mode="create"
            categories={categories}
            projects={projects}
            tagSuggestions={tagSuggestions}
            defaultUrl={isValidUrl(value) ? value : undefined}
            onDone={(id) => {
              setAddOpen(false);
              router.refresh();
              if (id) router.push(`/items/${id}`);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
