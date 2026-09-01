"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  LIBRARY_NAV,
  PRIMARY_NAV,
  SYSTEM_NAV,
  TYPE_NAV,
  type NavItem,
} from "@/lib/constants";
import type { DashboardCounts } from "@/lib/types";
import { cn } from "@/lib/utils";

function NavLink({
  item,
  count,
  onNavigate,
}: {
  item: NavItem;
  count?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    !item.external &&
    (pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)));
  const Icon = item.icon;

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={cn(
          "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
        )}
      >
        <Icon className="size-4 shrink-0 opacity-80" />
        <span className="flex-1 truncate">{item.label}</span>
        <ArrowUpRight className="size-3.5 shrink-0 opacity-50" />
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-80" />
      <span className="flex-1 truncate">{item.label}</span>
      {count != null && count > 0 && (
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      )}
    </Link>
  );
}

function Section({
  label,
  items,
  counts,
  onNavigate,
}: {
  label?: string;
  items: NavItem[];
  counts: DashboardCounts;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-0.5">
      {label && (
        <p className="px-2.5 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
          {label}
        </p>
      )}
      {items.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          count={item.countKey ? counts[item.countKey as keyof DashboardCounts] : undefined}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export function SidebarNav({
  counts,
  onNavigate,
}: {
  counts: DashboardCounts;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-2 py-3">
      <Section items={PRIMARY_NAV} counts={counts} onNavigate={onNavigate} />
      <Section label="Tipos" items={TYPE_NAV} counts={counts} onNavigate={onNavigate} />
      <Section label="Biblioteca" items={LIBRARY_NAV} counts={counts} onNavigate={onNavigate} />
      <Section label="Sistema" items={SYSTEM_NAV} counts={counts} onNavigate={onNavigate} />
    </nav>
  );
}
