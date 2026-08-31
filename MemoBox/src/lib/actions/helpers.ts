import "server-only";

import { colorFromString } from "@/lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve a list of tag names to tag ids for the current user, creating any
 * that don't exist yet. Returns the resolved ids.
 */
export async function resolveTagIds(
  supabase: SupabaseClient,
  userId: string,
  names: string[],
): Promise<string[]> {
  const clean = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (clean.length === 0) return [];

  const { data: existing } = await supabase
    .from("tags")
    .select("id, name")
    .eq("user_id", userId)
    .in("name", clean);

  const found = new Map((existing ?? []).map((t) => [t.name.toLowerCase(), t.id]));
  const missing = clean.filter((n) => !found.has(n.toLowerCase()));

  if (missing.length) {
    const { data: created } = await supabase
      .from("tags")
      .insert(
        missing.map((name) => ({
          user_id: userId,
          name,
          color: colorFromString(name),
        })),
      )
      .select("id, name");
    for (const t of created ?? []) found.set(t.name.toLowerCase(), t.id);
  }

  return clean
    .map((n) => found.get(n.toLowerCase()))
    .filter((id): id is string => !!id);
}

/** Replace the tag set attached to an item. */
export async function syncItemTags(
  supabase: SupabaseClient,
  userId: string,
  itemId: string,
  tagIds: string[],
) {
  await supabase.from("item_tags").delete().eq("item_id", itemId);
  if (tagIds.length) {
    await supabase.from("item_tags").insert(
      tagIds.map((tag_id) => ({ item_id: itemId, tag_id, user_id: userId })),
    );
  }
}

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
