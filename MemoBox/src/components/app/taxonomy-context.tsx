"use client";

import * as React from "react";
import type { Category, Project, Tag } from "@/lib/types";

type Taxonomy = { categories: Category[]; projects: Project[]; tags: Tag[] };

const Ctx = React.createContext<Taxonomy>({ categories: [], projects: [], tags: [] });

export function TaxonomyProvider({
  value,
  children,
}: {
  value: Taxonomy;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTaxonomy() {
  return React.useContext(Ctx);
}
