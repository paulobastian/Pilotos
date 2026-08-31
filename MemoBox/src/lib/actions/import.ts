"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseBookmarksHtml } from "@/lib/bookmarks";
import { guessType } from "@/lib/metadata";
import { resolveTagIds, syncItemTags, type ActionResult } from "@/lib/actions/helpers";

/**
 * Import a browser bookmarks HTML export. Each bookmark becomes an item in the
 * Inbox; the bookmark's folder is added as a tag so nothing is lost.
 */
export async function importBookmarks(
  html: string,
): Promise<ActionResult<{ imported: number; skipped: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  const bookmarks = parseBookmarksHtml(html);
  if (bookmarks.length === 0) {
    return { ok: false, error: "Nenhum bookmark encontrado no arquivo" };
  }
  const capped = bookmarks.slice(0, 2000);

  // Skip URLs already in the library.
  const { data: existing } = await supabase
    .from("items")
    .select("url")
    .eq("user_id", user.id)
    .not("url", "is", null);
  const known = new Set((existing ?? []).map((r) => r.url));

  const fresh = capped.filter((b) => !known.has(b.url));
  if (fresh.length === 0) {
    return { ok: true, data: { imported: 0, skipped: capped.length } };
  }

  const { data: inserted, error } = await supabase
    .from("items")
    .insert(
      fresh.map((b) => ({
        user_id: user.id,
        title: b.title.slice(0, 300),
        url: b.url,
        domain: b.domain,
        type: guessType(b.url),
        status: "inbox" as const,
        created_at: b.addedAt ?? undefined,
      })),
    )
    .select("id");
  if (error) return { ok: false, error: error.message };

  // Attach folder names as tags.
  const folderByIndex = fresh.map((b) => b.folder);
  const uniqueFolders = [...new Set(folderByIndex.filter(Boolean) as string[])];
  if (uniqueFolders.length && inserted) {
    const tagIds = await resolveTagIds(supabase, user.id, uniqueFolders);
    const tagIdByName = new Map(
      uniqueFolders.map((name, i) => [name, tagIds[i]]),
    );
    await Promise.all(
      inserted.map((row, i) => {
        const folder = folderByIndex[i];
        const tagId = folder ? tagIdByName.get(folder) : undefined;
        return tagId ? syncItemTags(supabase, user.id, row.id, [tagId]) : null;
      }),
    );
  }

  for (const p of ["/dashboard", "/items", "/inbox", "/tags"]) revalidatePath(p);
  return {
    ok: true,
    data: { imported: inserted?.length ?? 0, skipped: capped.length - fresh.length },
  };
}
