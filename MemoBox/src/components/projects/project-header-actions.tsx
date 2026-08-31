"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProject } from "@/lib/actions/taxonomy";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ProjectDialog } from "@/components/projects/project-dialog";

export function ProjectHeaderActions({ project }: { project: Project }) {
  const router = useRouter();
  const [confirm, setConfirm] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <ProjectDialog
        project={project}
        trigger={
          <Button variant="outline" size="sm">
            <Pencil className="size-4" />
            Editar
          </Button>
        }
      />
      <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}>
        <Trash2 className="size-4" />
        Excluir
      </Button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Excluir projeto?"
        description="Os itens do projeto não são apagados — apenas deixam de estar vinculados."
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          const r = await deleteProject(project.id);
          if (r.ok) {
            toast.success("Projeto excluído");
            router.push("/projects");
          } else toast.error(r.error);
        }}
      />
    </div>
  );
}
