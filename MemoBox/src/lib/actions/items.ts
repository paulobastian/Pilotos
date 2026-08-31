"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { itemInputSchema } from "@/lib/validations";
import { fetchUrlMetadata, guessType } from "@/lib/metadata";
import { getDomain, isValidUrl, normalizeUrl } from "@/lib/utils";
import { resolveTagIds, syncItemTags, type ActionResult } from "@/lib/actions/helpers";
import type { Item } from "@/lib/types";

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

function revalidateAll() {
  for (const p of [
    "/dashboard", "/items", "/inbox", "/favorites", "/archived", "/trash",
    "/tags", "/projects", "/categories", "/stats", "/history", "/search",
  ]) {
    revalidatePath(p);
  }
}

/**
 * Quick capture: paste a URL (or type a free-text idea) and save immediately.
 * Metadata is fetched server-side so the item lands fully populated.
 */
export async function quickAddItem(input: string): Promise<ActionResult<Item>> {
  const { supabase, user } = await authed();
  const value = input.trim();
  if (!value) return { ok: false, error: "Nada para salvar" };

  try {
    if (isValidUrl(value)) {
      const url = normalizeUrl(value);
      const meta = await fetchUrlMetadata(url);
      const { data, error } = await supabase
        .from("items")
        .insert({
          user_id: user.id,
          title: meta.title ?? meta.domain ?? url,
          url,
          description: meta.description,
          type: meta.type,
          status: "inbox",
          favicon: meta.favicon,
          thumbnail: meta.image,
          domain: meta.domain ?? getDomain(url),
        })
        .select()
        .single();
      if (error) throw error;
      revalidateAll();
      return { ok: true, data };
    }

    // Free text → an idea.
    const { data, error } = await supabase
      .from("items")
      .insert({
        user_id: user.id,
        title: value.slice(0, 300),
        type: "idea",
        status: "inbox",
      })
      .select()
      .single();
    if (error) throw error;
    revalidateAll();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}

export async function createItem(raw: unknown): Promise<ActionResult<Item>> {
  const { supabase, user } = await authed();
  const parsed = itemInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const input = parsed.data;
  const url = input.url ? normalizeUrl(input.url) : null;

  try {
    const { data, error } = await supabase
      .from("items")
      .insert({
        user_id: user.id,
        title: input.title,
        url,
        description: input.description ?? null,
        personal_note: input.personal_note ?? null,
        type: input.type,
        status: input.status,
        priority: input.priority,
        category_id: input.category_id ?? null,
        project_id: input.project_id ?? null,
        is_favorite: input.is_favorite,
        favicon: input.favicon ?? null,
        thumbnail: input.thumbnail ?? null,
        domain: input.domain ?? getDomain(url),
      })
      .select()
      .single();
    if (error) throw error;

    const tagIds = await resolveTagIds(supabase, user.id, input.tags);
    await syncItemTags(supabase, user.id, data.id, tagIds);

    revalidateAll();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro ao criar item" };
  }
}

export async function updateItem(id: string, raw: unknown): Promise<ActionResult<Item>> {
  const { supabase, user } = await authed();
  const parsed = itemInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const input = parsed.data;
  const url = input.url ? normalizeUrl(input.url) : null;

  try {
    const { data, error } = await supabase
      .from("items")
      .update({
        title: input.title,
        url,
        description: input.description ?? null,
        personal_note: input.personal_note ?? null,
        type: input.type,
        status: input.status,
        priority: input.priority,
        category_id: input.category_id ?? null,
        project_id: input.project_id ?? null,
        is_favorite: input.is_favorite,
        domain: input.domain ?? getDomain(url),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) throw error;

    const tagIds = await resolveTagIds(supabase, user.id, input.tags);
    await syncItemTags(supabase, user.id, id, tagIds);

    revalidateAll();
    revalidatePath(`/items/${id}`);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}

async function patch(id: string, values: Partial<Item>): Promise<ActionResult> {
  const { supabase, user } = await authed();
  const { error } = await supabase
    .from("items")
    .update(values)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  revalidatePath(`/items/${id}`);
  return { ok: true };
}

export async function toggleFavorite(id: string, value: boolean) {
  return patch(id, { is_favorite: value });
}

export async function setItemStatus(id: string, status: Item["status"]) {
  return patch(id, { status });
}

export async function archiveItem(id: string) {
  return patch(id, { status: "archived" });
}

export async function unarchiveItem(id: string) {
  return patch(id, { status: "review" });
}

export async function trashItem(id: string) {
  return patch(id, { deleted_at: new Date().toISOString() });
}

export async function restoreItem(id: string) {
  return patch(id, { deleted_at: null });
}

export async function deleteItemPermanently(id: string): Promise<ActionResult> {
  const { supabase, user } = await authed();
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function emptyTrash(): Promise<ActionResult> {
  const { supabase, user } = await authed();
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("user_id", user.id)
    .not("deleted_at", "is", null);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function duplicateItem(id: string): Promise<ActionResult<Item>> {
  const { supabase, user } = await authed();
  const { data: original, error } = await supabase
    .from("items")
    .select("*, item_tags(tag_id)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error || !original) return { ok: false, error: "Item não encontrado" };

  const { item_tags, id: _id, created_at, updated_at, last_opened_at, opened_count, ...rest } =
    original as Item & { item_tags: { tag_id: string }[] };
  void _id;
  void created_at;
  void updated_at;
  void last_opened_at;
  void opened_count;

  const { data: copy, error: insertErr } = await supabase
    .from("items")
    .insert({ ...rest, title: `${rest.title} (cópia)`, status: "inbox" })
    .select()
    .single();
  if (insertErr) return { ok: false, error: insertErr.message };

  const tagIds = (item_tags ?? []).map((t) => t.tag_id);
  if (tagIds.length) await syncItemTags(supabase, user.id, copy.id, tagIds);

  revalidateAll();
  return { ok: true, data: copy };
}

/** Record that the user opened an item's link (history + counters). */
export async function recordAccess(id: string): Promise<ActionResult> {
  const { supabase } = await authed();
  const { error } = await supabase.rpc("record_item_access", { p_item_id: id });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/history");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function refetchMetadata(id: string): Promise<ActionResult<Item>> {
  const { supabase, user } = await authed();
  const { data: item } = await supabase
    .from("items")
    .select("url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!item?.url) return { ok: false, error: "Item sem URL" };

  const meta = await fetchUrlMetadata(item.url);
  return patch(id, {
    description: meta.description,
    favicon: meta.favicon,
    thumbnail: meta.image,
    domain: meta.domain,
    type: meta.type ?? guessType(item.url),
  }) as Promise<ActionResult<Item>>;
}
