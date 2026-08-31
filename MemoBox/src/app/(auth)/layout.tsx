import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/brand";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block">
            <Logo />
          </Link>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l bg-sidebar lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--ring)_18%,transparent),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-center px-16">
          <p className="text-3xl font-semibold leading-snug tracking-tight">
            Suas ideias e links.
            <br />
            Organizados de verdade.
          </p>
          <p className="mt-4 max-w-md text-muted-foreground">
            Pare de perder aquele artigo, aquele vídeo, aquela ferramenta. Capture
            em segundos, organize quando quiser, encontre na hora.
          </p>
          <ul className="mt-10 space-y-3 text-sm text-muted-foreground">
            {[
              "Captura rápida: cole a URL e pronto",
              "Busca instantânea por título, tag, nota ou domínio",
              "Projetos para agrupar referências que andam juntas",
              "Inbox para não travar na hora de salvar",
            ].map((line) => (
              <li key={line} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
