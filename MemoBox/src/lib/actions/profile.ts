"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/helpers";

const schema = z.object({ name: z.string().trim().min(1).max(120) });

export async function updateProfileName(name: string): Promise<ActionResult> {
  const parsed = schema.safeParse({ name });
  if (!parsed.success) return { ok: false, error: "Nome inválido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  const { error } = await supabase
    .from("profiles")
    .update({ name: parsed.data.name })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  await supabase.auth.updateUser({ data: { name: parsed.data.name } });
  revalidatePath("/", "layout");
  return { ok: true };
}
