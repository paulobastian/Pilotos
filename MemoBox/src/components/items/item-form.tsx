"use client";

import * as React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { itemInputSchema, type ItemInput } from "@/lib/validations";
import { createItem, updateItem } from "@/lib/actions/items";
import {
  ITEM_PRIORITIES,
  ITEM_STATUSES,
  ITEM_TYPES,
} from "@/lib/constants";
import { getDomain, isValidUrl } from "@/lib/utils";
import type { Category, ItemWithRelations, Project, UrlMetadata } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/items/tag-input";

type Props = {
  mode: "create" | "edit";
  categories: Category[];
  projects: Project[];
  tagSuggestions?: string[];
  item?: ItemWithRelations;
  defaultUrl?: string;
  defaultProjectId?: string;
  onDone: (id?: string) => void;
};

export function ItemForm({
  mode,
  categories,
  projects,
  tagSuggestions = [],
  item,
  defaultUrl,
  defaultProjectId,
  onDone,
}: Props) {
  const [fetching, setFetching] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ItemInput>({
    resolver: zodResolver(itemInputSchema) as unknown as Resolver<ItemInput>,
    defaultValues: {
      title: item?.title ?? "",
      url: item?.url ?? defaultUrl ?? "",
      description: item?.description ?? "",
      personal_note: item?.personal_note ?? "",
      type: item?.type ?? "link",
      status: item?.status ?? "inbox",
      priority: item?.priority ?? "normal",
      category_id: item?.category_id ?? null,
      project_id: item?.project_id ?? defaultProjectId ?? null,
      is_favorite: item?.is_favorite ?? false,
      favicon: item?.favicon ?? null,
      thumbnail: item?.thumbnail ?? null,
      domain: item?.domain ?? null,
      tags: item?.tags.map((t) => t.name) ?? [],
    },
  });

  const fetchMeta = async () => {
    const url = getValues("url");
    if (!url || !isValidUrl(url)) {
      toast.error("Informe uma URL válida primeiro");
      return;
    }
    setFetching(true);
    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error();
      const meta: UrlMetadata = await res.json();
      if (meta.title && !getValues("title")) setValue("title", meta.title);
      if (meta.description && !getValues("description"))
        setValue("description", meta.description);
      setValue("thumbnail", meta.image);
      setValue("favicon", meta.favicon);
      setValue("domain", meta.domain ?? getDomain(url));
      if (mode === "create") setValue("type", meta.type);
      toast.success("Metadados carregados");
    } catch {
      toast.error("Não foi possível obter os metadados");
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const result =
      mode === "create"
        ? await createItem(values)
        : await updateItem(item!.id, values);
    if (result.ok) {
      toast.success(mode === "create" ? "Item salvo" : "Alterações salvas");
      onDone(result.data?.id ?? item?.id);
    } else {
      toast.error(result.error);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <div className="flex gap-2">
          <Input
            id="url"
            placeholder="https://…"
            {...register("url")}
            onBlur={(e) => {
              if (e.target.value && !getValues("domain")) {
                setValue("domain", getDomain(e.target.value));
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={fetchMeta}
            disabled={fetching}
            title="Buscar título, descrição e imagem"
          >
            {fetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...register("title")} />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" rows={2} {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="personal_note">Nota pessoal — por que você salvou isso?</Label>
        <Textarea
          id="personal_note"
          rows={2}
          placeholder="Ex.: usar como referência de layout no projeto X"
          {...register("personal_note")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <Select
                value={field.value ?? "none"}
                onValueChange={(v) => field.onChange(v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Projeto</Label>
          <Controller
            control={control}
            name="project_id"
            render={({ field }) => (
              <Select
                value={field.value ?? "none"}
                onValueChange={(v) => field.onChange(v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEM_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <TagInput
              id="tags"
              value={field.value}
              onChange={field.onChange}
              suggestions={tagSuggestions}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="is_favorite"
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
            />
            Marcar como favorito
          </label>
        )}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => onDone()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Salvar item" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
