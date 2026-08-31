"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { emptyTrash } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function EmptyTrashButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" />
        Esvaziar lixeira
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Esvaziar a lixeira?"
        description="Todos os itens na lixeira serão excluídos definitivamente."
        confirmLabel="Esvaziar"
        destructive
        onConfirm={async () => {
          const r = await emptyTrash();
          if (r.ok) {
            toast.success("Lixeira esvaziada");
            router.refresh();
          } else toast.error(r.error);
        }}
      />
    </>
  );
}
