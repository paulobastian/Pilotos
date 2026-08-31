import {
  Archive,
  Bookmark,
  BookOpen,
  Box,
  FileText,
  Folder,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  Link2,
  ListChecks,
  Package,
  Star,
  Tag,
  Trash2,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { ItemPriority, ItemStatus, ItemType } from "@/lib/types";

type Option<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
  color?: string;
};

export const ITEM_TYPES: Option<ItemType>[] = [
  { value: "link", label: "Link", icon: Link2 },
  { value: "idea", label: "Ideia", icon: Lightbulb },
  { value: "article", label: "Artigo", icon: FileText },
  { value: "video", label: "Vídeo", icon: Video },
  { value: "book", label: "Livro", icon: BookOpen },
  { value: "course", label: "Curso", icon: GraduationCap },
  { value: "tool", label: "Ferramenta", icon: Wrench },
  { value: "product", label: "Produto", icon: Package },
  { value: "reference", label: "Referência", icon: Bookmark },
  { value: "other", label: "Outro", icon: Box },
];

export const ITEM_TYPE_MAP = Object.fromEntries(
  ITEM_TYPES.map((t) => [t.value, t]),
) as Record<ItemType, Option<ItemType>>;

export const ITEM_STATUSES: Option<ItemStatus>[] = [
  { value: "inbox", label: "Inbox", color: "#64748b" },
  { value: "review", label: "Para revisar", color: "#d97706" },
  { value: "in_progress", label: "Em andamento", color: "#2563eb" },
  { value: "done", label: "Concluído", color: "#16a34a" },
  { value: "archived", label: "Arquivado", color: "#6b7280" },
];

export const ITEM_STATUS_MAP = Object.fromEntries(
  ITEM_STATUSES.map((s) => [s.value, s]),
) as Record<ItemStatus, Option<ItemStatus>>;

export const ITEM_PRIORITIES: Option<ItemPriority>[] = [
  { value: "low", label: "Baixa", color: "#94a3b8" },
  { value: "normal", label: "Normal", color: "#64748b" },
  { value: "high", label: "Alta", color: "#dc2626" },
];

export const ITEM_PRIORITY_MAP = Object.fromEntries(
  ITEM_PRIORITIES.map((p) => [p.value, p]),
) as Record<ItemPriority, Option<ItemPriority>>;

export const TAG_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#d946ef", "#ec4899", "#64748b",
];

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  countKey?: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/items", label: "Todos os itens", icon: ListChecks, countKey: "all" },
  { href: "/favorites", label: "Favoritos", icon: Star, countKey: "favorites" },
  { href: "/inbox", label: "Inbox", icon: Inbox, countKey: "inbox" },
];

export const TYPE_NAV: NavItem[] = [
  { href: "/type/idea", label: "Ideias", icon: Lightbulb, countKey: "idea" },
  { href: "/type/link", label: "Links", icon: Link2, countKey: "link" },
  { href: "/type/article", label: "Artigos", icon: FileText, countKey: "article" },
  { href: "/type/video", label: "Vídeos", icon: Video, countKey: "video" },
  { href: "/type/tool", label: "Ferramentas", icon: Wrench, countKey: "tool" },
];

export const LIBRARY_NAV: NavItem[] = [
  { href: "/projects", label: "Projetos", icon: Folder, countKey: "projects" },
  { href: "/tags", label: "Tags", icon: Tag, countKey: "tags" },
  { href: "/categories", label: "Categorias", icon: Folder },
];

export const SYSTEM_NAV: NavItem[] = [
  { href: "/archived", label: "Arquivados", icon: Archive, countKey: "archived" },
  { href: "/trash", label: "Lixeira", icon: Trash2, countKey: "trash" },
];

export const DEFAULT_CATEGORIES = [
  "Tecnologia", "Programação", "Negócios", "Investimentos", "Ideias",
  "Estudos", "Ferramentas", "Design", "Projetos", "Inspirações",
];

export const PAGE_SIZE = 24;
