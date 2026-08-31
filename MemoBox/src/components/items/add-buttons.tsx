"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppUI } from "@/components/app/ui-context";

export function AddFirstItemButton() {
  const { openAdd } = useAppUI();
  return (
    <Button onClick={() => openAdd()}>
      <Plus className="size-4" />
      Adicionar primeiro item
    </Button>
  );
}

export function AddItemButton({
  label = "Adicionar",
  prefill,
  variant = "default",
  size = "sm",
}: {
  label?: string;
  prefill?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default";
}) {
  const { openAdd } = useAppUI();
  return (
    <Button variant={variant} size={size} onClick={() => openAdd(prefill)}>
      <Plus className="size-4" />
      {label}
    </Button>
  );
}
