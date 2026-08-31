import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, Link2 } from "lucide-react";
import { getItem } from "@/lib/queries";
import { ITEM_PRIORITY_MAP, ITEM_STATUS_MAP, ITEM_TYPE_MAP } from "@/lib/constants";
import { faviconFor, formatDate, relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, TagChip, TypeBadge } from "@/components/items/badges";
import { ItemDetailActions } from "@/components/items/item-detail-actions";

export async function generateMetadata({
  params,
}: PageProps<"/items/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  return { title: item?.title ?? "Item" };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

export default async function ItemDetailPage({ params }: PageProps<"/items/[id]">) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const favicon = item.favicon ?? faviconFor(item.domain);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link href="/items">
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
      </Button>

      {item.thumbnail && (
        <div className="overflow-hidden rounded-xl border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnail}
            alt=""
            className="max-h-72 w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="" className="size-4 rounded-sm" />
          )}
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-foreground hover:underline"
            >
              {item.domain ?? item.url}
            </a>
          ) : (
            <span>Sem link</span>
          )}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>

        {item.description && (
          <p className="text-muted-foreground">{item.description}</p>
        )}
      </div>

      <ItemDetailActions item={item} />

      {item.personal_note && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Nota pessoal
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm">{item.personal_note}</p>
        </div>
      )}

      <div className="rounded-xl border">
        <div className="divide-y px-4">
          <Field label="Tipo">
            <TypeBadge type={item.type} />
          </Field>
          <Field label="Status">
            <StatusBadge status={item.status} />
          </Field>
          <Field label="Prioridade">{ITEM_PRIORITY_MAP[item.priority].label}</Field>
          <Field label="Categoria">
            {item.category ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.category.color }}
                />
                {item.category.name}
              </span>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Projeto">
            {item.project ? (
              <Link href={`/projects/${item.project.id}`} className="hover:underline">
                {item.project.name}
              </Link>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Tags">
            {item.tags.length ? (
              <span className="flex flex-wrap justify-end gap-1">
                {item.tags.map((t) => (
                  <TagChip key={t.id} tag={t} href={`/tags/${t.id}`} />
                ))}
              </span>
            ) : (
              "—"
            )}
          </Field>
        </div>
      </div>

      <Separator />

      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-4" /> Criado {formatDate(item.created_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <Link2 className="size-4" /> Atualizado {relativeTime(item.updated_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="size-4" /> Aberto {item.opened_count}×
          {item.last_opened_at && ` · ${relativeTime(item.last_opened_at)}`}
        </span>
      </div>
    </div>
  );
}
