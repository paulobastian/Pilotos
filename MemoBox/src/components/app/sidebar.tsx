import Link from "next/link";
import type { DashboardCounts } from "@/lib/types";
import { Logo } from "@/components/brand";
import { SidebarNav } from "@/components/app/sidebar-nav";

export function Sidebar({ counts }: { counts: DashboardCounts }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-14 items-center px-4">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <SidebarNav counts={counts} />
      </div>
    </aside>
  );
}
