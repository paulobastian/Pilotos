"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-20 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <h2 className="mt-4 font-medium">Algo deu errado</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Não foi possível carregar esta página. Tente novamente.
      </p>
      <Button className="mt-5" onClick={reset}>
        Tentar de novo
      </Button>
    </div>
  );
}
