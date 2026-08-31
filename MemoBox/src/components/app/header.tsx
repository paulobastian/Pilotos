"use client";

import * as React from "react";
import { Menu, Plus, Search } from "lucide-react";
import type { DashboardCounts, Profile } from "@/lib/types";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { UserMenu } from "@/components/app/user-menu";
import { useAppUI } from "@/components/app/ui-context";

export function Header({
  counts,
  profile,
  email,
}: {
  counts: DashboardCounts;
  profile: Profile | null;
  email: string;
}) {
  const { setSearchOpen, openAdd } = useAppUI();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:px-4">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader>
            <SheetTitle asChild>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto scrollbar-thin">
            <SidebarNav counts={counts} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Logo showText={false} className="lg:hidden" />

      <button
        onClick={() => setSearchOpen(true)}
        className="group flex h-9 flex-1 items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-md"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Buscar…</span>
        <kbd className="hidden rounded border bg-background px-1.5 text-[10px] font-medium sm:inline">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" className="gap-1.5" onClick={() => openAdd()}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Adicionar</span>
        </Button>
        <ThemeToggle />
        <UserMenu profile={profile} email={email} />
      </div>
    </header>
  );
}
