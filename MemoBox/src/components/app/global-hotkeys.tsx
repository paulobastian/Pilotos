"use client";

import { useHotkey } from "@/lib/hooks";
import { useAppUI } from "@/components/app/ui-context";

/** App-wide keyboard shortcuts: Ctrl/Cmd+K search, Ctrl/Cmd+N new item. */
export function GlobalHotkeys() {
  const { setSearchOpen, openAdd, addOpen, searchOpen } = useAppUI();

  useHotkey("mod+k", () => setSearchOpen(!searchOpen), { allowInInput: true });
  useHotkey("mod+n", () => openAdd(), { allowInInput: true });

  // Plain "/" also opens search when not typing.
  useHotkey("/", () => {
    if (!addOpen && !searchOpen) setSearchOpen(true);
  });

  return null;
}
