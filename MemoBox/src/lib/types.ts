// Domain types shared across the app. These mirror the Postgres schema in
// supabase/migrations. Kept hand-written (instead of `supabase gen types`) so
// the app stays readable and self-documenting.

export type ItemType =
  | "link"
  | "idea"
  | "article"
  | "video"
  | "book"
  | "course"
  | "tool"
  | "product"
  | "reference"
  | "other";

export type ItemStatus = "inbox" | "review" | "in_progress" | "done" | "archived";

export type ItemPriority = "low" | "normal" | "high";

export type ViewMode = "grid" | "list";

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  item_count?: number;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  url: string | null;
  description: string | null;
  personal_note: string | null;
  type: ItemType;
  status: ItemStatus;
  priority: ItemPriority;
  favicon: string | null;
  thumbnail: string | null;
  domain: string | null;
  category_id: string | null;
  project_id: string | null;
  is_favorite: boolean;
  opened_count: number;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
  deleted_at: string | null;
}

/** Item joined with its category, project and tags — the shape used in the UI. */
export interface ItemWithRelations extends Item {
  category: Pick<Category, "id" | "name" | "color"> | null;
  project: Pick<Project, "id" | "name" | "color"> | null;
  tags: Pick<Tag, "id" | "name" | "color">[];
}

export interface UrlMetadata {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  domain: string | null;
  type: ItemType;
}

export interface DashboardCounts {
  all: number;
  favorites: number;
  inbox: number;
  archived: number;
  trash: number;
  unopened: number;
  idea: number;
  link: number;
  article: number;
  video: number;
  tool: number;
  projects: number;
  tags: number;
}
