"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  categoryInputSchema,
  projectInputSchema,
  tagInputSchema,
} from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/helpers";
import type { Category, Project, Tag } from "@/lib/types";

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

function revalidate(paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

/* ------------------------------ categories ------------------------------ */

export async function createCategory(raw: unknown): Promise<ActionResult<Category>> {
  const { supabase, user } = await authed();
  const parsed = categoryInputSchema.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const { data, error } = await supabase
    .from("categories")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();
  if (error)
    return {
      ok: false,
      error: error.code === "23505" ? "Já existe uma categoria com esse nome" : error.message,
    };
  revalidate(["/categories", "/dashboard", "/items"]);
  return { ok: true, data };
}

export async function updateCategory(id: string, raw: unknown): Promise<ActionResult> {
  const { supabase, user } = await authed();
  const parsed = categoryInputSchema.partial().safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };
  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidate(["/categories", "/dashboard", "/items"]);
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase, user } = await authed();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidate(["/categories", "/dashboard", "/items"]);
  return { ok: true };
}

export async function reorderCategories(orderedIds: string[]): Promise<ActionResult> {
  const { supabase, user } = await authed();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("categories")
        .update({ position: index })
        .eq("id", id)
        .eq("user_id", user.id),
    ),
  );
  revalidate(["/categories"]);
  return { ok: true };
}

/* --------------------------------- tags --------------------------------- */

export async function createTag(raw: unknown): Promise<ActionResult<Tag>> {
  const { supabase, user } = await authed();
  const parsed = tagInputSchema.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const { data, error } = await supabase
    .from("tags")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();
  if (error)
    return {
      ok: false,
      error: error.code === "23505" ? "Essa tag já existe" : error.message,
    };
  revalidate(["/tags", "/dashboard"]);
  return { ok: true, data };
}

export async function updateTag(id: string, raw: unknown): Promise<ActionResult> {
  const { supabase, user } = await authed();
  const parsed = tagInputSchema.partial().safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };
  const { error } = await supabase
    .from("tags")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidate(["/tags", "/items", "/dashboard"]);
  return { ok: true };
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const { supabase, user } = await authed();
  const { error } = await supabase.from("tags").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidate(["/tags", "/items", "/dashboard"]);
  return { ok: true };
}

/* ------------------------------- projects ------------------------------- */

export async function createProject(raw: unknown): Promise<ActionResult<Project>> {
  const { supabase, user } = await authed();
  const parsed = projectInputSchema.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  revalidate(["/projects", "/dashboard"]);
  return { ok: true, data };
}

export async function updateProject(id: string, raw: unknown): Promise<ActionResult> {
  const { supabase, user } = await authed();
  const parsed = projectInputSchema.partial().safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };
  const { error } = await supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidate(["/projects", `/projects/${id}`, "/dashboard"]);
  return { ok: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const { supabase, user } = await authed();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidate(["/projects", "/dashboard", "/items"]);
  return { ok: true };
}
