import Link from "next/link";
import {
  ArrowRight,
  FolderKanban,
  Inbox,
  Search,
  Sparkles,
  Tags,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/theme-toggle";

const FEATURES = [
  {
    icon: Zap,
    title: "Captura em segundos",
    body: "Cole uma URL e pressione Enter. O título, a descrição e a imagem vêm sozinhos.",
  },
  {
    icon: Inbox,
    title: "Inbox primeiro",
    body: "Capture agora, organize depois. Nada de travar no meio da navegação.",
  },
  {
    icon: Search,
    title: "Busca instantânea",
    body: "Título, descrição, nota pessoal, domínio, tag ou projeto — tudo indexado.",
  },
  {
    icon: Tags,
    title: "Tags e categorias",
    body: "Uma taxonomia leve que você molda com o tempo, do seu jeito.",
  },
  {
    icon: FolderKanban,
    title: "Projetos",
    body: "Agrupe ideias, referências, vídeos e ferramentas que andam juntas.",
  },
  {
    icon: Sparkles,
    title: "Notas pessoais",
    body: "Registre por que você salvou aquilo. É o que faz a diferença meses depois.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Abrir app</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Começar agora</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:py-32">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" /> Seu segundo cérebro
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Suas ideias e links. Organizados de verdade.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Salve, organize e encontre tudo aquilo que você não quer esquecer.
            Sem favoritos bagunçados, sem link perdido no WhatsApp.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={user ? "/dashboard" : "/signup"}>
                Começar agora <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border bg-card p-5">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-3 font-medium">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t bg-sidebar">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Três perguntas. Uma resposta.
            </h2>
            <dl className="mt-8 grid gap-6 text-left sm:grid-cols-3">
              {[
                ["Onde eu salvo isso?", "No IdeaVault."],
                ["Cadê aquele link?", "Busca instantânea."],
                ["Por que salvei isso?", "Na sua nota pessoal."],
              ].map(([q, a]) => (
                <div key={q}>
                  <dt className="font-medium">{q}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
          <Logo showText={false} />
          <span>IdeaVault — projeto piloto</span>
        </div>
      </footer>
    </div>
  );
}
