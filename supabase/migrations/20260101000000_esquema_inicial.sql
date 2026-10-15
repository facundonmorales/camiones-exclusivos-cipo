-- ════════════════════════════════════════════════════════════════
-- Camiones Exclusivos — esquema inicial
-- Tablas, enums, triggers, Row Level Security y Storage.
-- Se puede correr completo en Supabase → SQL Editor, o con
-- `supabase db push` usando la CLI.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Enums ───────────────────────────────────────────────────────
create type public.categoria_unidad as enum ('camion', 'tractor', 'volcador', 'chasis', 'otro');
create type public.condicion_unidad as enum ('usado', '0km');
create type public.estado_unidad    as enum ('disponible', 'reservado', 'vendido');
create type public.moneda           as enum ('ARS', 'USD');

-- ── Administradores ─────────────────────────────────────────────
-- Un usuario de Supabase Auth solo puede gestionar el catálogo si
-- su id figura en esta tabla (ver README: "Crear el primer administrador").
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ── Unidades ────────────────────────────────────────────────────
create table public.unidades (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  marca               text not null,
  modelo              text not null,
  titulo              text not null,
  categoria           public.categoria_unidad not null default 'camion',
  condicion           public.condicion_unidad not null default 'usado',
  anio                integer check (anio between 1950 and 2100), -- null = año a confirmar
  km                  integer check (km >= 0),
  traccion            text,
  descripcion_corta   text,
  descripcion         text,
  -- Lista de pares clave/valor: [{"clave":"Motor","valor":"MWM 6.12"}, ...]
  especificaciones    jsonb not null default '[]'::jsonb check (jsonb_typeof(especificaciones) = 'array'),
  moneda              public.moneda not null default 'ARS',
  precio              numeric(14, 2) check (precio >= 0), -- null = "Consultar"
  acepta_financiacion boolean not null default false,
  acepta_canje        boolean not null default false,
  entrega_inmediata   boolean not null default false,
  estado              public.estado_unidad not null default 'disponible',
  vendido_at          timestamptz, -- se completa solo; sirve para mostrar vendidas por un tiempo
  visible             boolean not null default true,
  destacada           boolean not null default false,
  orden               integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index unidades_listado_idx on public.unidades (visible, destacada desc, orden, created_at desc);

create or replace function public.tg_unidades_timestamps()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;

  if new.estado = 'vendido' then
    if tg_op = 'INSERT' or old.estado is distinct from 'vendido' then
      new.vendido_at := coalesce(new.vendido_at, now());
    end if;
  else
    new.vendido_at := null;
  end if;

  return new;
end;
$$;

create trigger unidades_timestamps
before insert or update on public.unidades
for each row execute function public.tg_unidades_timestamps();

-- ── Fotos de unidades ───────────────────────────────────────────
create table public.unidad_fotos (
  id           uuid primary key default gen_random_uuid(),
  unidad_id    uuid not null references public.unidades (id) on delete cascade,
  url          text not null,
  storage_path text, -- ruta dentro del bucket "fotos", para poder borrarla
  orden        integer not null default 0,
  es_portada   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index unidad_fotos_unidad_idx on public.unidad_fotos (unidad_id, orden);
create unique index unidad_fotos_una_portada on public.unidad_fotos (unidad_id) where es_portada;

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- Público: solo lectura de lo visible. Admins: todo.
-- ════════════════════════════════════════════════════════════════
alter table public.admins            enable row level security;
alter table public.unidades          enable row level security;
alter table public.unidad_fotos      enable row level security;

-- admins: cada usuario puede ver solo su propia fila (no hay alta desde la web)
create policy "admins_select_propio" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- unidades
create policy "unidades_select" on public.unidades
  for select using (visible = true or public.is_admin());
create policy "unidades_insert_admin" on public.unidades
  for insert to authenticated with check (public.is_admin());
create policy "unidades_update_admin" on public.unidades
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "unidades_delete_admin" on public.unidades
  for delete to authenticated using (public.is_admin());

-- fotos: se ven si la unidad es visible
create policy "fotos_select" on public.unidad_fotos
  for select using (
    public.is_admin()
    or exists (select 1 from public.unidades u where u.id = unidad_id and u.visible = true)
  );
create policy "fotos_insert_admin" on public.unidad_fotos
  for insert to authenticated with check (public.is_admin());
create policy "fotos_update_admin" on public.unidad_fotos
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "fotos_delete_admin" on public.unidad_fotos
  for delete to authenticated using (public.is_admin());


-- ════════════════════════════════════════════════════════════════
-- Storage: bucket "fotos" (lectura pública, escritura solo admins)
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "fotos_storage_lectura_publica" on storage.objects
  for select using (bucket_id = 'fotos');
create policy "fotos_storage_insert_admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'fotos' and public.is_admin());
create policy "fotos_storage_update_admin" on storage.objects
  for update to authenticated using (bucket_id = 'fotos' and public.is_admin());
create policy "fotos_storage_delete_admin" on storage.objects
  for delete to authenticated using (bucket_id = 'fotos' and public.is_admin());
