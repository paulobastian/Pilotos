"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { importBookmarks } from "@/lib/actions/import";
import { updateProfileName } from "@/lib/actions/profile";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfilePanel({ profile, email }: { profile: Profile | null; email: string }) {
  const router = useRouter();
  const [name, setName] = React.useState(profile?.name ?? "");
  const [pending, start] = React.useTransition();

  return (
    <div className="space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="font-medium">Perfil</h2>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <div className="flex gap-2">
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button
            disabled={pending || !name.trim() || name === profile?.name}
            onClick={() =>
              start(async () => {
                const r = await updateProfileName(name.trim());
                if (r.ok) {
                  toast.success("Nome atualizado");
                  router.refresh();
                } else toast.error(r.error);
              })
            }
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ImportPanel() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const html = await file.text();
      const r = await importBookmarks(html);
      if (r.ok) {
        toast.success(
          `${r.data?.imported ?? 0} itens importados${
            r.data?.skipped ? ` · ${r.data.skipped} já existiam` : ""
          }`,
        );
        router.refresh();
      } else {
        toast.error(r.error);
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 rounded-xl border p-5">
      <div>
        <h2 className="font-medium">Importar favoritos</h2>
        <p className="text-sm text-muted-foreground">
          Exporte seus favoritos do Chrome, Firefox ou Edge como HTML e envie o
          arquivo aqui. Cada favorito entra na Inbox; a pasta de origem vira uma tag.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".html,text/html"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <Button variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        Selecionar arquivo HTML
      </Button>
    </div>
  );
}

const SHORTCUTS = [
  ["Ctrl / ⌘ + K", "Abrir busca"],
  ["Ctrl / ⌘ + N", "Novo item"],
  ["/", "Abrir busca"],
  ["E", "Editar item (na página do item)"],
  ["F", "Favoritar item (na página do item)"],
  ["Esc", "Fechar modal"],
];

export function ShortcutsPanel() {
  return (
    <div className="space-y-3 rounded-xl border p-5">
      <h2 className="font-medium">Atalhos de teclado</h2>
      <dl className="divide-y text-sm">
        {SHORTCUTS.map(([key, desc]) => (
          <div key={key} className="flex items-center justify-between py-2">
            <dt className="text-muted-foreground">{desc}</dt>
            <dd>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-medium">
                {key}
              </kbd>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
