import Link from "next/link";
import { ITEM_STATUS_MAP, ITEM_TYPE_MAP } from "@/lib/constants";
import type { ItemStatus, ItemType, Tag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function TypeBadge({ type }: { type: ItemType }) {
  const t = ITEM_TYPE_MAP[type];
  const Icon = t.icon;
  return (
    <Badge variant="muted" className="gap-1">
      {Icon && <Icon className="size-3" />}
      {t.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: ItemStatus }) {
  const s = ITEM_STATUS_MAP[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: s.color }}
      />
      {s.label}
    </span>
  );
}

export function TagChip({
  tag,
  href,
  className,
}: {
  tag: Pick<Tag, "id" | "name" | "color">;
  href?: string;
  className?: string;
}) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-foreground/75",
        className,
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${tag.color} 12%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      {tag.name}
    </span>
  );
  return href ? (
    <Link href={href} className="hover:opacity-80">
      {content}
    </Link>
  ) : (
    content
  );
}
