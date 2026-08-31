"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { projectInputSchema, type ProjectInput } from "@/lib/validations";
import { createProject, updateProject } from "@/lib/actions/taxonomy";
import { colorFromString } from "@/lib/utils";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ProjectDialog({
  project,
  trigger,
}: {
  project?: Project;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const mode = project ? "edit" : "create";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema) as unknown as Resolver<ProjectInput>,
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      image_url: project?.image_url ?? "",
      color: project?.color ?? "#64748b",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      color: values.color || colorFromString(values.name),
    };
    const r = project
      ? await updateProject(project.id, payload)
      : await createProject(payload);
    if (r.ok) {
      toast.success(project ? "Projeto atualizado" : "Projeto criado");
      setOpen(false);
      reset();
      router.refresh();
    } else {
      toast.error(r.error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="size-4" />
            Novo projeto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo projeto" : "Editar projeto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Nome</Label>
            <Input id="p-name" autoFocus {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">Descrição</Label>
            <Textarea id="p-desc" rows={3} {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-img">Imagem (URL, opcional)</Label>
            <Input id="p-img" placeholder="https://…" {...register("image_url")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
