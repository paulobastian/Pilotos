import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProject } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ItemCollection } from "@/components/items/item-collection";
import { AddItemButton } from "@/components/items/add-buttons";
import { ProjectHeaderActions } from "@/components/projects/project-header-actions";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  return { title: project?.name ?? "Projeto" };
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link href="/projects">
          <ArrowLeft className="size-4" />
          Projetos
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 size-4 shrink-0 rounded"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              criado em {formatDate(project.created_at)}
            </p>
          </div>
        </div>
        <ProjectHeaderActions project={project} />
      </div>

      <div className="flex justify-end">
        <AddItemButton label="Adicionar ao projeto" />
      </div>

      <ItemCollection
        searchParams={sp}
        baseFilters={{ projectId: id }}
        emptyTitle="Nenhum item neste projeto ainda"
        emptyDescription="Relacione links, ideias e referências a este projeto pelo formulário de item."
      />
    </div>
  );
}
