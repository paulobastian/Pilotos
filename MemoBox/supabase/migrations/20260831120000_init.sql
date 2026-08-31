-- IdeaVault — initial schema
-- Second brain for links, ideas, articles, videos, tools and references.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "pg_trgm" with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.item_type as enum (
  'link', 'idea', 'article', 'video', 'book', 'course', 'tool', 'product', 'reference', 'other'
);

create type public.item_status as enum (
  'inbox', 'review', 'in_progress', 'done', 'archived'
);

create type public.item_priority as enum ('low', 'normal', 'high');

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  email       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default extensions.gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  color       text not null default '#64748b',
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, name)
);

create index categories_user_id_idx on public.categories (user_id);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
create table public.tags (
  id          uuid primary key default extensions.gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  color       text not null default '#64748b',
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);

create index tags_user_id_idx on public.tags (user_id);
create index tags_name_trgm_idx on public.tags using gin (name extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id          uuid primary key default extensions.gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  image_url   text,
  color       text not null default '#64748b',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_user_id_idx on public.projects (user_id);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- items
-- ---------------------------------------------------------------------------
create table public.items (
  id             uuid primary key default extensions.gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  title          text not null default 'Sem título',
  url            text,
  description    text,
  personal_note  text,
  type           public.item_type    not null default 'link',
  status         public.item_status  not null default 'inbox',
  priority       public.item_priority not null default 'normal',
  favicon        text,
  thumbnail      text,
  domain         text,
  category_id    uuid references public.categories (id) on delete set null,
  project_id     uuid references public.projects (id) on delete set null,
  is_favorite    boolean not null default false,
  opened_count   integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  last_opened_at timestamptz,
  deleted_at     timestamptz,
  -- Full text search vector kept in sync by trigger below.
  search_tsv     tsvector
);

create index items_user_id_idx        on public.items (user_id);
create index items_status_idx         on public.items (user_id, status);
create index items_type_idx           on public.items (user_id, type);
create index items_category_id_idx    on public.items (category_id);
create index items_project_id_idx     on public.items (project_id);
create index items_favorite_idx       on public.items (user_id) where is_favorite;
create index items_not_deleted_idx    on public.items (user_id, created_at desc) where deleted_at is null;
create index items_domain_idx         on public.items (user_id, domain);
create index items_search_tsv_idx     on public.items using gin (search_tsv);
create index items_title_trgm_idx     on public.items using gin (title extensions.gin_trgm_ops);

create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- Full text search vector (title + description + note + domain).
create or replace function public.items_update_search_tsv()
returns trigger
language plpgsql
as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.domain, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.personal_note, '')), 'C');
  return new;
end;
$$;

create trigger items_search_tsv_trigger
  before insert or update of title, description, personal_note, domain on public.items
  for each row execute function public.items_update_search_tsv();

-- ---------------------------------------------------------------------------
-- item_tags  (m:n)
-- ---------------------------------------------------------------------------
create table public.item_tags (
  item_id uuid not null references public.items (id) on delete cascade,
  tag_id  uuid not null references public.tags (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (item_id, tag_id)
);

create index item_tags_tag_id_idx on public.item_tags (tag_id);
create index item_tags_user_id_idx on public.item_tags (user_id);

-- ---------------------------------------------------------------------------
-- access_history
-- ---------------------------------------------------------------------------
create table public.access_history (
  id          uuid primary key default extensions.gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  item_id     uuid not null references public.items (id) on delete cascade,
  accessed_at timestamptz not null default now()
);

create index access_history_user_idx on public.access_history (user_id, accessed_at desc);
create index access_history_item_idx on public.access_history (item_id);

-- ---------------------------------------------------------------------------
-- RPC: record that an item was opened (bumps counters + history)
-- ---------------------------------------------------------------------------
create or replace function public.record_item_access(p_item_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.items
     set last_opened_at = now(),
         opened_count = opened_count + 1
   where id = p_item_id
     and user_id = auth.uid();

  if found then
    insert into public.access_history (user_id, item_id)
    values (auth.uid(), p_item_id);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.tags           enable row level security;
alter table public.projects       enable row level security;
alter table public.items          enable row level security;
alter table public.item_tags      enable row level security;
alter table public.access_history enable row level security;

-- profiles: a user manages only their own profile row.
create policy "profiles are self-owned"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles update self"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles insert self"
  on public.profiles for insert with check (auth.uid() = id);

-- Generic owner policies for the resource tables.
create policy "categories are owner-only" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tags are owner-only" on public.tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects are owner-only" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "items are owner-only" on public.items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "item_tags are owner-only" on public.item_tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "access_history is owner-only" on public.access_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
