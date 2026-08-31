import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

/**
 * Stat tile: label (sentence case, no colon) + value. Values use proportional
 * figures — `tabular-nums` is reserved for columns that align vertically.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-accent/30"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        <span>{label}</span>
        <ArrowUpRight className="ml-auto size-4 opacity-0 transition-opacity group-hover:opacity-60" />
      </div>
      <p className="mt-2 text-2xl font-semibold leading-none">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </Link>
  );
}
