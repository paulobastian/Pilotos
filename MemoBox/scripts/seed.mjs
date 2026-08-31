// Seed the local Supabase database with a demo account and sample library.
// Usage: node scripts/seed.mjs   (requires `npx supabase start` running)
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- load .env.local -------------------------------------------------------
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "demo@ideavault.app";
const PASSWORD = "ideavault123";

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

async function main() {
  // --- user --------------------------------------------------------------
  let userId;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Paulo" },
  });

  if (createErr) {
    if (!/already/i.test(createErr.message)) throw createErr;
    const { data: list } = await supabase.auth.admin.listUsers();
    userId = list.users.find((u) => u.email === EMAIL)?.id;
    console.log("• demo user already exists — wiping their data");
    await supabase.from("items").delete().eq("user_id", userId);
    await supabase.from("tags").delete().eq("user_id", userId);
    await supabase.from("categories").delete().eq("user_id", userId);
    await supabase.from("projects").delete().eq("user_id", userId);
  } else {
    userId = created.user.id;
    console.log("• created demo user");
  }
  if (!userId) throw new Error("could not resolve demo user id");

  const own = (rows) => rows.map((r) => ({ ...r, user_id: userId }));

  // --- categories ------------------------------------------------------
  const categoryNames = [
    ["Programação", "#3b82f6"],
    ["Design", "#ec4899"],
    ["Investimentos", "#22c55e"],
    ["Negócios", "#f97316"],
    ["Estudos", "#8b5cf6"],
    ["Ferramentas", "#14b8a6"],
    ["Inspirações", "#eab308"],
  ];
  const { data: categories } = await supabase
    .from("categories")
    .insert(own(categoryNames.map(([name, color], position) => ({ name, color, position }))))
    .select();
  const cat = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // --- tags ----------------------------------------------------------------
  const tagNames = [
    ["react", "#06b6d4"], ["nextjs", "#64748b"], ["typescript", "#3b82f6"],
    ["android", "#22c55e"], ["kotlin", "#a855f7"], ["ia", "#8b5cf6"],
    ["ux", "#ec4899"], ["produtividade", "#f59e0b"], ["carreira", "#ef4444"],
    ["renda-fixa", "#10b981"], ["leitura", "#eab308"], ["open-source", "#6366f1"],
  ];
  const { data: tags } = await supabase
    .from("tags")
    .insert(own(tagNames.map(([name, color]) => ({ name, color }))))
    .select();
  const tag = Object.fromEntries(tags.map((t) => [t.name, t.id]));

  // --- projects ----------------------------------------------------------
  const { data: projects } = await supabase
    .from("projects")
    .insert(
      own([
        {
          name: "Aplicativo de Treino",
          description:
            "Referências, ideias e ferramentas para o app de treino que quero construir.",
          color: "#3b82f6",
        },
        {
          name: "Reformular o portfólio",
          description: "Inspirações de layout e conteúdo para o novo site pessoal.",
          color: "#ec4899",
        },
        {
          name: "Carteira 2026",
          description: "Estudos sobre alocação e renda fixa para o próximo ano.",
          color: "#22c55e",
        },
      ]),
    )
    .select();
  const proj = Object.fromEntries(projects.map((p) => [p.name, p.id]));

  // --- items -------------------------------------------------------------
  const items = [
    {
      title: "Como criar aplicativos Android com Kotlin",
      url: "https://developer.android.com/kotlin",
      domain: "developer.android.com",
      description: "Guia oficial do Android para desenvolvimento em Kotlin.",
      personal_note:
        "Base para o app de treino. Começar pelo módulo de coroutines e pelo Jetpack Compose.",
      type: "article",
      status: "in_progress",
      priority: "high",
      category_id: cat["Programação"],
      project_id: proj["Aplicativo de Treino"],
      is_favorite: true,
      created_at: daysAgo(2),
      tags: ["android", "kotlin"],
    },
    {
      title: "Next.js — App Router docs",
      url: "https://nextjs.org/docs/app",
      domain: "nextjs.org",
      description: "Documentação do App Router, Server Components e data fetching.",
      personal_note: "Consultar sempre que esquecer o cache de fetch.",
      type: "reference",
      status: "review",
      category_id: cat["Programação"],
      is_favorite: true,
      created_at: daysAgo(5),
      tags: ["nextjs", "react", "typescript"],
    },
    {
      title: "Raindrop.io",
      url: "https://raindrop.io",
      domain: "raindrop.io",
      description: "Gerenciador de bookmarks com coleções e visual em cards.",
      personal_note:
        "Gostei de como organizam os cards e o preview. Usar como referência de UI.",
      type: "tool",
      status: "done",
      category_id: cat["Ferramentas"],
      project_id: proj["Reformular o portfólio"],
      created_at: daysAgo(8),
      tags: ["ux", "produtividade"],
    },
    {
      title: "The Science of Well-Being",
      url: "https://www.coursera.org/learn/the-science-of-well-being",
      domain: "coursera.org",
      description: "Curso de Yale sobre hábitos e bem-estar.",
      type: "course",
      status: "inbox",
      category_id: cat["Estudos"],
      created_at: daysAgo(1),
      tags: ["leitura"],
    },
    {
      title: "Tesouro Direto — como funciona o Tesouro Selic",
      url: "https://www.tesourodireto.com.br/titulos/tipos-de-tesouro.htm",
      domain: "tesourodireto.com.br",
      description: "Explicação dos títulos públicos e sua rentabilidade.",
      personal_note: "Comparar liquidez do Selic com CDB de liquidez diária.",
      type: "article",
      status: "review",
      priority: "normal",
      category_id: cat["Investimentos"],
      project_id: proj["Carteira 2026"],
      created_at: daysAgo(12),
      tags: ["renda-fixa"],
    },
    {
      title: "Refactoring UI",
      url: "https://www.refactoringui.com",
      domain: "refactoringui.com",
      description: "Livro sobre design prático para quem programa.",
      personal_note: "Reler o capítulo de hierarquia visual antes de mexer no portfólio.",
      type: "book",
      status: "inbox",
      category_id: cat["Design"],
      project_id: proj["Reformular o portfólio"],
      is_favorite: true,
      created_at: daysAgo(3),
      tags: ["ux", "leitura"],
    },
    {
      title: "Um jeito melhor de pensar em produtividade pessoal",
      type: "idea",
      description:
        "E se o app sugerisse revisar itens antigos que nunca foram abertos? Um 'continue explorando' semanal.",
      personal_note: "Ideia para a v2 do IdeaVault.",
      status: "inbox",
      category_id: cat["Inspirações"],
      created_at: daysAgo(1),
      tags: ["ia", "produtividade"],
    },
    {
      title: "shadcn/ui",
      url: "https://ui.shadcn.com",
      domain: "ui.shadcn.com",
      description: "Componentes React copy-paste com Radix + Tailwind.",
      type: "tool",
      status: "done",
      category_id: cat["Programação"],
      created_at: daysAgo(20),
      tags: ["react", "open-source"],
    },
    {
      title: "Como estruturar um roadmap de carreira em tech",
      url: "https://newsletter.pragmaticengineer.com",
      domain: "newsletter.pragmaticengineer.com",
      description: "Newsletter sobre engenharia de software e carreira.",
      type: "article",
      status: "review",
      category_id: cat["Negócios"],
      created_at: daysAgo(15),
      tags: ["carreira"],
    },
    {
      title: "Figma — arquivo de inspiração de dashboards",
      url: "https://www.figma.com/community",
      domain: "figma.com",
      description: "Comunidade do Figma com kits e templates.",
      personal_note: "Salvar 3 referências de dashboard antes de desenhar as telas.",
      type: "reference",
      status: "in_progress",
      category_id: cat["Design"],
      project_id: proj["Aplicativo de Treino"],
      created_at: daysAgo(6),
      tags: ["ux"],
    },
    {
      title: "MDN — CSS Grid",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout",
      domain: "developer.mozilla.org",
      description: "Referência completa de CSS Grid.",
      type: "reference",
      status: "archived",
      category_id: cat["Programação"],
      created_at: daysAgo(40),
      tags: ["open-source"],
    },
    {
      title: "Vídeo: arquitetura limpa na prática",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      domain: "youtube.com",
      description: "Palestra sobre camadas, casos de uso e dependências.",
      type: "video",
      status: "inbox",
      category_id: cat["Programação"],
      created_at: daysAgo(4),
      tags: ["typescript", "carreira"],
    },
  ];

  for (const raw of items) {
    const { tags: itemTags = [], ...row } = raw;
    const { data: inserted, error } = await supabase
      .from("items")
      .insert({ ...row, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    if (itemTags.length) {
      await supabase.from("item_tags").insert(
        itemTags.map((name) => ({ item_id: inserted.id, tag_id: tag[name], user_id: userId })),
      );
    }
  }

  // --- a little access history -----------------------------------------
  const { data: someItems } = await supabase
    .from("items")
    .select("id")
    .eq("user_id", userId)
    .not("url", "is", null)
    .limit(4);
  if (someItems?.length) {
    await supabase.from("access_history").insert(
      someItems.flatMap((it, i) => [
        { user_id: userId, item_id: it.id, accessed_at: daysAgo(i) },
        { user_id: userId, item_id: it.id, accessed_at: daysAgo(i + 7) },
      ]),
    );
    await supabase
      .from("items")
      .update({ last_opened_at: daysAgo(0), opened_count: 3 })
      .eq("id", someItems[0].id);
  }

  console.log(`\n✓ Seed complete`);
  console.log(`  Login:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
