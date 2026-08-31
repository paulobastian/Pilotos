import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import type {
  Category,
  DashboardCounts,
  ItemStatus,
  ItemType,
  ItemWithRelations,
  Profile,
  Project,
  Tag,
} from "@/lib/types";

const ITEM_SELECT =
  "*, category:categories(id,name,color), project:projects(id,name,color), item_tags(tag:tags(id,name,color))";

type RawItem = Omit<ItemWithRelations, "tags"> & {
  item_tags: { tag: Pick<Tag, "id" | "name" | "color"> | null }[] | null;
};

function shapeItem(row: RawItem): ItemWithRelations {
  const { item_tags, ...rest } = row;
  return {
    ...rest,
    tags: (item_tags ?? [])
      .map((t) => t.tag)
      .filter((t): t is Pick<Tag, "id" | "name" | "color"> => !!t)
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** Current authenticated user — redirects to /login when missing. */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const user = await requireUser();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});

export interface ItemFilters {
  statuses?: ItemStatus[];
  excludeStatuses?: ItemStatus[];
  type?: ItemType;
  categoryId?: string;
  projectId?: string;
  tagId?: string;
  favorite?: boolean;
  unopened?: boolean;
  deleted?: boolean;
  search?: string;
  sort?: "recent" | "oldest" | "title" | "updated" | "priority";
  page?: number;
  pageSize?: number;
}

export async function getItems(filters: ItemFilters = {}): Promise<{
  items: ItemWithRelations[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const user = await requireUser();

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("items")
    .select(ITEM_SELECT, { count: "exact" })
    .eq("user_id", user.id);

  query = filters.deleted
    ? query.not("deleted_at", "is", null)
    : query.is("deleted_at", null);

  if (filters.statuses?.length) query = query.in("status", filters.statuses);
  if (filters.excludeStatuses?.length)
    query = query.not("status", "in", `(${filters.excludeStatuses.join(",")})`);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.favorite) query = query.eq("is_favorite", true);
  if (filters.unopened) query = query.is("last_opened_at", null);

  if (filters.tagId) {
    const { data: tagged } = await supabase
      .from("item_tags")
      .select("item_id")
      .eq("user_id", user.id)
      .eq("tag_id", filters.tagId);
    const ids = (tagged ?? []).map((t) => t.item_id);
    if (ids.length === 0)
      return { items: [], total: 0, page, pageSize };
    query = query.in("id", ids);
  }

  if (filters.search?.trim()) {
    query = query.textSearch("search_tsv", filters.search.trim(), {
      type: "websearch",
      config: "simple",
    });
  }

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "title":
      query = query.order("title", { ascending: true });
      break;
    case "updated":
      query = query.order("updated_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return {
    items: (data as RawItem[] | null)?.map(shapeItem) ?? [],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export const getItem = cache(
  async (id: string): Promise<ItemWithRelations | null> => {
    const supabase = await createClient();
    await requireUser();
    const { data } = await supabase
      .from("items")
      .select(ITEM_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data ? shapeItem(data as RawItem) : null;
  },
);

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const user = await requireUser();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  const { data: counts } = await supabase
    .from("items")
    .select("category_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .not("category_id", "is", null);

  const byId = new Map<string, number>();
  for (const row of counts ?? [])
    byId.set(row.category_id!, (byId.get(row.category_id!) ?? 0) + 1);

  return (categories ?? []).map((c) => ({ ...c, item_count: byId.get(c.id) ?? 0 }));
});

export const getTags = cache(async (): Promise<Tag[]> => {
  const supabase = await createClient();
  const user = await requireUser();
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const { data: links } = await supabase
    .from("item_tags")
    .select("tag_id")
    .eq("user_id", user.id);

  const byId = new Map<string, number>();
  for (const row of links ?? [])
    byId.set(row.tag_id, (byId.get(row.tag_id) ?? 0) + 1);

  return (tags ?? []).map((t) => ({ ...t, item_count: byId.get(t.id) ?? 0 }));
});

export const getTag = cache(async (id: string): Promise<Tag | null> => {
  const supabase = await createClient();
  await requireUser();
  const { data } = await supabase.from("tags").select("*").eq("id", id).maybeSingle();
  return data;
});

export const getProjects = cache(async (): Promise<Project[]> => {
  const supabase = await createClient();
  const user = await requireUser();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const { data: counts } = await supabase
    .from("items")
    .select("project_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .not("project_id", "is", null);

  const byId = new Map<string, number>();
  for (const row of counts ?? [])
    byId.set(row.project_id!, (byId.get(row.project_id!) ?? 0) + 1);

  return (projects ?? []).map((p) => ({ ...p, item_count: byId.get(p.id) ?? 0 }));
});

export const getProject = cache(async (id: string): Promise<Project | null> => {
  const supabase = await createClient();
  await requireUser();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
});

export const getDashboardCounts = cache(async (): Promise<DashboardCounts> => {
  const supabase = await createClient();
  const user = await requireUser();

  const base = () =>
    supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", user.id);

  const countType = (t: ItemType) =>
    base().is("deleted_at", null).eq("type", t);

  const [
    all,
    favorites,
    inbox,
    archived,
    trash,
    unopened,
    idea,
    link,
    article,
    video,
    tool,
    projects,
    tags,
  ] = await Promise.all([
    base().is("deleted_at", null).not("status", "eq", "archived"),
    base().is("deleted_at", null).eq("is_favorite", true),
    base().is("deleted_at", null).eq("status", "inbox"),
    base().is("deleted_at", null).eq("status", "archived"),
    base().not("deleted_at", "is", null),
    base().is("deleted_at", null).is("last_opened_at", null),
    countType("idea"),
    countType("link"),
    countType("article"),
    countType("video"),
    countType("tool"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("tags").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return {
    all: all.count ?? 0,
    favorites: favorites.count ?? 0,
    inbox: inbox.count ?? 0,
    archived: archived.count ?? 0,
    trash: trash.count ?? 0,
    unopened: unopened.count ?? 0,
    idea: idea.count ?? 0,
    link: link.count ?? 0,
    article: article.count ?? 0,
    video: video.count ?? 0,
    tool: tool.count ?? 0,
    projects: projects.count ?? 0,
    tags: tags.count ?? 0,
  };
});

export async function getRecentlyAccessed(limit = 12): Promise<
  { accessed_at: string; item: ItemWithRelations }[]
> {
  const supabase = await createClient();
  const user = await requireUser();
  const { data } = await supabase
    .from("access_history")
    .select(`accessed_at, item:items(${ITEM_SELECT})`)
    .eq("user_id", user.id)
    .order("accessed_at", { ascending: false })
    .limit(limit * 3);

  const seen = new Set<string>();
  const out: { accessed_at: string; item: ItemWithRelations }[] = [];
  for (const row of (data ?? []) as unknown as {
    accessed_at: string;
    item: RawItem | null;
  }[]) {
    if (!row.item || seen.has(row.item.id)) continue;
    seen.add(row.item.id);
    out.push({ accessed_at: row.accessed_at, item: shapeItem(row.item) });
    if (out.length >= limit) break;
  }
  return out;
}

export interface Stats {
  byType: { type: ItemType; count: number }[];
  topTags: { name: string; color: string; count: number }[];
  topCategories: { name: string; color: string; count: number }[];
  topDomains: { domain: string; count: number }[];
  byMonth: { month: string; count: number }[];
  totals: {
    items: number;
    projects: number;
    tags: number;
    categories: number;
    domains: number;
  };
}

export async function getStats(): Promise<Stats> {
  const supabase = await createClient();
  const user = await requireUser();

  const { data: items } = await supabase
    .from("items")
    .select("type, domain, category_id, created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const rows = items ?? [];
  const typeCount = new Map<string, number>();
  const domainCount = new Map<string, number>();
  const monthCount = new Map<string, number>();
  const catCount = new Map<string, number>();

  for (const r of rows) {
    typeCount.set(r.type, (typeCount.get(r.type) ?? 0) + 1);
    if (r.domain) domainCount.set(r.domain, (domainCount.get(r.domain) ?? 0) + 1);
    if (r.category_id) catCount.set(r.category_id, (catCount.get(r.category_id) ?? 0) + 1);
    const month = (r.created_at as string).slice(0, 7);
    monthCount.set(month, (monthCount.get(month) ?? 0) + 1);
  }

  const [categories, tags] = await Promise.all([getCategories(), getTags()]);
  const { count: projectCount } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Last 6 months, oldest first.
  const months: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      month: d.toLocaleDateString("pt-BR", { month: "short" }),
      count: monthCount.get(key) ?? 0,
    });
  }

  return {
    byType: [...typeCount.entries()]
      .map(([type, count]) => ({ type: type as ItemType, count }))
      .sort((a, b) => b.count - a.count),
    topTags: tags
      .filter((t) => (t.item_count ?? 0) > 0)
      .sort((a, b) => (b.item_count ?? 0) - (a.item_count ?? 0))
      .slice(0, 8)
      .map((t) => ({ name: t.name, color: t.color, count: t.item_count ?? 0 })),
    topCategories: categories
      .filter((c) => (c.item_count ?? 0) > 0)
      .sort((a, b) => (b.item_count ?? 0) - (a.item_count ?? 0))
      .slice(0, 8)
      .map((c) => ({ name: c.name, color: c.color, count: c.item_count ?? 0 })),
    topDomains: [...domainCount.entries()]
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    byMonth: months,
    totals: {
      items: rows.length,
      projects: projectCount ?? 0,
      tags: tags.length,
      categories: categories.length,
      domains: domainCount.size,
    },
  };
}
