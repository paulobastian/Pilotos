# IdeaVault

Seu segundo cérebro para links, ideias, artigos, vídeos, ferramentas e referências.
Capture em segundos, organize quando quiser, encontre na hora.

> **Regra do produto:** salvar algo leva poucos segundos; encontrar algo leva poucos segundos.

## Stack

| Camada        | Tecnologia                                             |
| ------------- | ----------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack) + React 19         |
| Linguagem     | TypeScript (strict)                                   |
| Estilo        | Tailwind CSS v4 + componentes no estilo shadcn/ui     |
| Backend / DB  | Supabase (PostgreSQL + Auth + RLS)                    |
| Forms         | react-hook-form + zod                                 |
| Gráficos      | Recharts                                              |
| Ícones        | lucide-react                                          |

Autenticação por cookies via `@supabase/ssr`; o refresh de sessão e a proteção
de rotas ficam em [`src/proxy.ts`](src/proxy.ts) (o `middleware` do Next 16).
**Row Level Security** garante que cada usuário só enxerga os próprios dados.

## Pré-requisitos

- Node.js 20.9+ (o projeto foi desenvolvido no Node 24)
- Docker Desktop em execução (para o Supabase local)
- Supabase CLI — usado via `npx`, não precisa instalar

## Como rodar (Supabase local)

```bash
cd MemoBox
npm install

# 1. Sobe o Supabase local (Postgres + Auth + Studio) e aplica as migrations
npx supabase start
npx supabase migration up

# 2. Copia as chaves impressas pelo `supabase start` para o .env.local
#    (o .env.local já vem preenchido com as chaves padrão do CLI)

# 3. Popula com a conta e a biblioteca de demonstração
npm run db:seed

# 4. Sobe o app
npm run dev
```

App em <http://localhost:3000> · Supabase Studio em <http://localhost:54323>
· E-mails de teste (confirmação/reset) em <http://localhost:54324> (Mailpit).

### Conta de demonstração

```
E-mail:  demo@ideavault.app
Senha:   ideavault123
```

`npm run db:seed` recria essa conta do zero (apaga e repovoa os dados dela) com
categorias, tags, 3 projetos e ~12 itens de exemplo.

## Scripts

| Comando             | O que faz                                             |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                          |
| `npm run build`     | Build de produção                                    |
| `npm run typecheck` | `tsc --noEmit`                                        |
| `npm run db:start`  | `supabase start`                                      |
| `npm run db:reset`  | Recria o banco local a partir das migrations         |
| `npm run db:seed`   | Recria a conta demo + dados de exemplo               |

## Funcionalidades

- **Captura rápida** — cole uma URL e pressione Enter; título, descrição, imagem,
  favicon e domínio vêm por Open Graph. Texto livre vira uma "ideia".
- **Inbox** — capture agora, organize depois.
- **Itens** — CRUD completo, favoritar, arquivar, lixeira (soft delete), duplicar,
  nota pessoal, prioridade, status, tipo.
- **Busca global** — full-text (Postgres `tsvector`) sobre título, descrição, nota
  e domínio, com filtros por tipo / status / categoria. `Ctrl/⌘ + K` abre a paleta.
- **Tags e categorias** — criar, renomear, recolorir, excluir; contagem de itens.
- **Projetos** — agrupam ideias, referências, vídeos e ferramentas.
- **Estatísticas** — por tipo, por mês, tags/categorias/domínios mais usados.
- **Histórico** — itens abertos recentemente.
- **Importação** — envie o HTML de favoritos do Chrome/Firefox/Edge; cada favorito
  entra na Inbox e a pasta de origem vira uma tag.
- **Grid / Lista** — alternância com preferência salva no `localStorage`.
- **Dark mode**, responsivo (sidebar vira drawer no mobile), estados de
  loading / empty / error, skeletons, atalhos de teclado.

## Estrutura

```
src/
  app/
    (auth)/          login, signup, forgot-password
    (app)/           área autenticada (layout com sidebar + header)
      dashboard, items, items/[id], inbox, favorites, archived, trash,
      type/[type], tags, tags/[id], categories, projects, projects/[id],
      search, stats, history, settings
    auth/callback/   troca do code OAuth por sessão
    api/             metadata (Open Graph), search
    reset-password/  fora do guard de auth (usuário já logado pelo link)
  components/
    ui/              primitivos (button, dialog, select, command, …)
    app/             shell (sidebar, header, command palette, contexts)
    items/           card, row, form, ações, coleção reutilizável
    taxonomy/ projects/ stats/ settings/ auth/ search/
  lib/
    supabase/        client (browser), server, middleware helper, admin
    actions/         server actions (items, taxonomy, auth, import, profile)
    queries.ts       leituras server-side (cache do React)
    metadata.ts      scraping de Open Graph
    bookmarks.ts     parser de favoritos Netscape HTML
    validations.ts   schemas zod
    constants.ts types.ts utils.ts hooks.ts
  proxy.ts           refresh de sessão + proteção de rotas
supabase/
  migrations/        schema + índices + triggers + RLS + RPC
scripts/seed.mjs     dados de demonstração
```

## Banco de dados

Entidades: `profiles`, `categories`, `tags`, `projects`, `items`, `item_tags`,
`access_history`. Enums: `item_type`, `item_status`, `item_priority`.
Destaques:

- `profiles` criado automaticamente por trigger em `auth.users`.
- `items.search_tsv` (tsvector) mantido por trigger → busca full-text com índice GIN.
- `record_item_access(uuid)` — RPC que incrementa contadores e grava no histórico.
- RLS `auth.uid() = user_id` em todas as tabelas.

## Migrar para o Supabase Cloud

1. Crie um projeto em [supabase.com](https://supabase.com).
2. `npx supabase link --project-ref <ref>` e `npx supabase db push`.
3. Troque as três variáveis do `.env.local` pelas chaves do projeto cloud e
   defina `NEXT_PUBLIC_SITE_URL` com a URL de produção.
4. Em Authentication → URL Configuration, adicione `<site>/auth/callback` como
   redirect.

O código não muda — o mesmo cliente `@supabase/ssr` atende local e cloud.

## Preparado para evoluir

A arquitetura já acomoda: extensão de navegador (as server actions e o
`/api/metadata` são o backend dela), apps móveis (mesma API Supabase), IA para
classificação/resumo/sugestão de tags (campos e o fluxo de captura já isolam
esse ponto), busca semântica (basta uma coluna `embedding` + índice), coleções
compartilhadas e planos Free/Pro (RLS por `user_id` já isola tudo).
