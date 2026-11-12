-- ════════════════════════════════════════════════════════════════
--  TODO UN CUBO — Esquema de base de datos (Supabase / PostgreSQL)
--  Ejecuta este archivo completo en Supabase → SQL Editor.
--  Es idempotente: puedes volver a ejecutarlo sin perder datos.
-- ════════════════════════════════════════════════════════════════

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ─── Utilidades ────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── Administradores ───────────────────────────────────────────
-- Añade tu usuario aquí después de crearlo en Authentication → Users:
--   insert into public.admins (user_id) select id from auth.users where email = 'tu@correo.com';
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ─── Categorías ────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  accent text not null default 'gold',          -- gold | grass | diamond | redstone | stone
  sort_order int not null default 0,
  -- Palabras clave para clasificar automáticamente los videos importados de YouTube
  video_keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Videos de YouTube ─────────────────────────────────────────
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null unique,               -- evita duplicados
  title text not null,
  description text,
  thumbnail_url text,
  url text not null,
  published_at timestamptz not null,
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'published' check (status in ('pending','published','hidden')),
  is_featured boolean not null default false,
  source text not null default 'rss' check (source in ('rss','api','websub','manual')),
  reviewed boolean not null default false,       -- marcado al revisarlo en el panel
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists videos_published_idx on public.videos (status, published_at desc);
create index if not exists videos_category_idx on public.videos (category_id, published_at desc);

-- ─── Semillas ──────────────────────────────────────────────────
create table if not exists public.seeds (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  seed_code text not null,
  image_url text,
  description text,
  mc_version text not null,
  editions text[] not null default '{java}' check (editions <@ array['java','bedrock']::text[] and cardinality(editions) > 0),
  video_id uuid references public.videos(id) on delete set null,
  status text not null default 'published' check (status in ('draft','published')),
  is_featured boolean not null default false,
  published_at timestamptz not null default now(),
  -- Campos derivados (los mantiene un trigger; no editar a mano)
  structure_types text[] not null default '{}',
  search_text text not null default '',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seed_code, mc_version)                 -- evita semillas duplicadas
);
create index if not exists seeds_published_idx on public.seeds (status, published_at desc);
create index if not exists seeds_structures_idx on public.seeds using gin (structure_types);
create index if not exists seeds_editions_idx on public.seeds using gin (editions);
create index if not exists seeds_search_idx on public.seeds using gin (search_text extensions.gin_trgm_ops);

create table if not exists public.seed_structures (
  id uuid primary key default gen_random_uuid(),
  seed_id uuid not null references public.seeds(id) on delete cascade,
  type text not null check (type in (
    'village','blacksmith','mansion','desert_temple','jungle_temple','ocean_monument',
    'ancient_city','trial_chamber','pillager_outpost','shipwreck','ruined_portal',
    'stronghold','nether_fortress','bastion','end_city','igloo','mineshaft','trail_ruins','other')),
  name text,
  x int not null,
  y int,
  z int not null,
  dimension text not null default 'overworld' check (dimension in ('overworld','nether','end')),
  notes text,
  sort_order int not null default 0
);
create index if not exists seed_structures_seed_idx on public.seed_structures (seed_id, sort_order);

-- Recalcula structure_types y search_text de una semilla
create or replace function public.refresh_seed_search(p_seed uuid)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  update public.seeds s set
    structure_types = coalesce((select array_agg(distinct st.type) from public.seed_structures st where st.seed_id = s.id), '{}'),
    search_text = lower(unaccent(concat_ws(' ',
      s.name, s.seed_code, s.description, s.mc_version, array_to_string(s.editions, ' '),
      (select string_agg(concat_ws(' ', st.type, st.name, st.notes), ' ') from public.seed_structures st where st.seed_id = s.id)
    )))
  where s.id = p_seed;
end $$;

create or replace function public.trg_seed_structures_refresh()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.refresh_seed_search(coalesce(new.seed_id, old.seed_id));
  return null;
end $$;

create or replace function public.trg_seeds_search()
returns trigger language plpgsql set search_path = public, extensions as $$
begin
  new.search_text = lower(unaccent(concat_ws(' ',
    new.name, new.seed_code, new.description, new.mc_version, array_to_string(new.editions, ' '),
    (select string_agg(concat_ws(' ', st.type, st.name, st.notes), ' ') from public.seed_structures st where st.seed_id = new.id)
  )));
  return new;
end $$;

drop trigger if exists seed_structures_refresh on public.seed_structures;
create trigger seed_structures_refresh after insert or update or delete on public.seed_structures
  for each row execute function public.trg_seed_structures_refresh();

drop trigger if exists seeds_search on public.seeds;
create trigger seeds_search before insert or update of name, seed_code, description, mc_version, editions on public.seeds
  for each row execute function public.trg_seeds_search();

-- ─── Publicaciones (mods, shaders, tutoriales, novedades, todo un cubo…) ──
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  excerpt text,
  content text not null default '',             -- Markdown
  cover_url text,
  gallery text[] not null default '{}',
  links jsonb not null default '[]'::jsonb,      -- [{ "label": "Descargar", "url": "https://…" }]
  video_id uuid references public.videos(id) on delete set null,
  status text not null default 'published' check (status in ('draft','published')),
  is_featured boolean not null default false,
  published_at timestamptz not null default now(),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);
create index if not exists posts_published_idx on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category_id, status, published_at desc);

-- ─── Ajustes y registros de sincronización ─────────────────────
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.settings (key, value) values
  ('sync_interval_minutes', '30'::jsonb),
  ('auto_publish_videos', 'true'::jsonb),
  ('last_sync_at', 'null'::jsonb)
on conflict (key) do nothing;

create table if not exists public.sync_logs (
  id bigserial primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  trigger text not null,                         -- cron | websub | manual
  source text,                                   -- api | rss
  ok boolean not null default false,
  inserted int not null default 0,
  updated int not null default 0,
  message text
);
create index if not exists sync_logs_started_idx on public.sync_logs (started_at desc);

-- ─── Triggers updated_at ───────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['categories','videos','seeds','posts','settings'] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════
--  Seguridad: Row Level Security
--  Público: solo lectura de contenido publicado. Escritura: solo admins.
-- ════════════════════════════════════════════════════════════════
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.videos enable row level security;
alter table public.seeds enable row level security;
alter table public.seed_structures enable row level security;
alter table public.posts enable row level security;
alter table public.settings enable row level security;
alter table public.sync_logs enable row level security;

drop policy if exists "admins self read" on public.admins;
create policy "admins self read" on public.admins for select using (user_id = auth.uid());

drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "videos public read" on public.videos;
create policy "videos public read" on public.videos for select using (status = 'published' or public.is_admin());
drop policy if exists "videos admin write" on public.videos;
create policy "videos admin write" on public.videos for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "seeds public read" on public.seeds;
create policy "seeds public read" on public.seeds for select using ((status = 'published' and published_at <= now()) or public.is_admin());
drop policy if exists "seeds admin write" on public.seeds;
create policy "seeds admin write" on public.seeds for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "structures public read" on public.seed_structures;
create policy "structures public read" on public.seed_structures for select using (
  exists (select 1 from public.seeds s where s.id = seed_id and ((s.status = 'published' and s.published_at <= now()) or public.is_admin())));
drop policy if exists "structures admin write" on public.seed_structures;
create policy "structures admin write" on public.seed_structures for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts for select using ((status = 'published' and published_at <= now()) or public.is_admin());
drop policy if exists "posts admin write" on public.posts;
create policy "posts admin write" on public.posts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings admin" on public.settings;
create policy "settings admin" on public.settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sync_logs admin read" on public.sync_logs;
create policy "sync_logs admin read" on public.sync_logs for select using (public.is_admin());

-- ─── Almacenamiento de imágenes ────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/png','image/jpeg','image/webp','image/avif','image/gif'])
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ─── Categorías iniciales ──────────────────────────────────────
insert into public.categories (slug, name, description, accent, sort_order, video_keywords) values
  ('mods-y-addons', 'Mods y Add-ons', 'Mods, complementos y add-ons para Java y Bedrock.', 'grass', 1, '{mod,mods,addon,add-on,addons,complemento}'),
  ('shaders-y-texturas', 'Shaders y texturas', 'Shaders, packs de texturas y recursos visuales.', 'diamond', 2, '{shader,shaders,textura,texturas,texture,resource pack}'),
  ('tutoriales', 'Tutoriales', 'Guías, instalaciones, configuraciones y consejos.', 'stone', 3, '{tutorial,como,cómo,guia,guía,instalar}'),
  ('novedades', 'Novedades', 'Noticias y actualizaciones de Minecraft.', 'redstone', 4, '{snapshot,actualizacion,actualización,update,novedades,noticia}'),
  ('todo-un-cubo', 'Todo un Cubo', 'Curiosidades, secretos, construcciones, experimentos y trucos.', 'gold', 5, '{curiosidad,secreto,truco,experimento,construccion,construcción,decoracion,decoración}')
on conflict (slug) do nothing;
