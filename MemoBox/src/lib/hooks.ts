"use client";

import * as React from "react";
import type { ViewMode } from "@/lib/types";

/** Debounce any fast-changing value (search input, etc.). */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const VIEW_KEY = "ideavault:view-mode";

function readViewMode(): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_KEY);
    if (stored === "grid" || stored === "list") return stored;
  } catch {
    /* ignore */
  }
  return "grid";
}

/** Grid/list preference, persisted to localStorage. */
export function useViewMode(): [ViewMode, (v: ViewMode) => void] {
  // Start from a stable value for SSR, then sync from storage after mount.
  const [mode, setMode] = React.useState<ViewMode>("grid");

  React.useEffect(() => {
    setMode(readViewMode());
    const onStorage = (e: StorageEvent) => {
      if (e.key === VIEW_KEY) setMode(readViewMode());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = React.useCallback((v: ViewMode) => {
    setMode(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  return [mode, update];
}

/** Register a global keyboard shortcut. `combo` like "mod+k", "n", "shift+/". */
export function useHotkey(
  combo: string,
  handler: (e: KeyboardEvent) => void,
  options: { enabled?: boolean; allowInInput?: boolean } = {},
) {
  const { enabled = true, allowInInput = false } = options;
  const handlerRef = React.useRef(handler);

  React.useEffect(() => {
    handlerRef.current = handler;
  });

  React.useEffect(() => {
    if (!enabled) return;
    const parts = combo.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const needMod = parts.includes("mod");
    const needShift = parts.includes("shift");
    const needAlt = parts.includes("alt");

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isInput && !allowInInput) return;

      const mod = e.metaKey || e.ctrlKey;
      if (needMod !== mod) return;
      if (needShift !== e.shiftKey) return;
      if (needAlt !== e.altKey) return;
      if (e.key.toLowerCase() !== key) return;

      e.preventDefault();
      handlerRef.current(e);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [combo, enabled, allowInInput]);
}
