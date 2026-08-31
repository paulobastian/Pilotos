"use client";

import * as React from "react";

type AppUI = {
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  /** Optional prefill passed to the add dialog (e.g. from the command palette). */
  addPrefill: string | null;
  openAdd: (prefill?: string) => void;
};

const Ctx = React.createContext<AppUI | null>(null);

export function AppUIProvider({ children }: { children: React.ReactNode }) {
  const [addOpen, setAddOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [addPrefill, setAddPrefill] = React.useState<string | null>(null);

  const openAdd = React.useCallback((prefill?: string) => {
    setAddPrefill(prefill ?? null);
    setAddOpen(true);
  }, []);

  const value = React.useMemo(
    () => ({ addOpen, setAddOpen, searchOpen, setSearchOpen, addPrefill, openAdd }),
    [addOpen, searchOpen, addPrefill, openAdd],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppUI() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAppUI must be used within AppUIProvider");
  return ctx;
}
