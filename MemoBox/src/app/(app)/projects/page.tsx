import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { getProjects } from "@/lib/queries";
import { formatDate, relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectDialog } from "@/components/projects/project-dialog";

export const metadata: Metadata = { title: "Projetos" };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader
        title="Projetos"
        description="Agrupe ideias, referências, vídeos e ferramentas que andam juntas."
        action={<ProjectDialog />}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Nenhum projeto ainda"
          description="Crie um projeto como 'Aplicativo de Treino' e comece a relacionar itens a ele."
          action={<ProjectDialog />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
            >
              <div
                className="h-24 border-b"
                style={{
                  background: p.image_url
                    ? `center/cover url(${p.image_url})`
                    : `linear-gradient(135deg, ${p.color}, color-mix(in srgb, ${p.color} 40%, transparent))`,
                }}
              />
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h3 className="font-medium">{p.name}</h3>
                {p.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                  <span>
                    {p.item_count ?? 0} {p.item_count === 1 ? "item" : "itens"}
                  </span>
                  <span title={formatDate(p.created_at)}>
                    atualizado {relativeTime(p.updated_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
