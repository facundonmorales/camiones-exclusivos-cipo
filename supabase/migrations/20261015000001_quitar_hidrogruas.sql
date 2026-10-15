-- Quita todo lo relacionado con hidrogrúas (la empresa no ofrece ese servicio).
-- Se puede correr sobre una base creada con cualquier versión del esquema.

-- 1. Tabla de equipos de alquiler (y sus políticas y trigger, que se van con ella)
drop table if exists public.equipos_hidrogrua cascade;
drop function if exists public.tg_set_updated_at();

-- 2. Categoría "con_hidrogrua": las unidades que la tuvieran pasan a "camion"
--    y se recrea el enum sin ese valor.
do $$
begin
  if exists (
    select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
    where t.typname = 'categoria_unidad' and e.enumlabel = 'con_hidrogrua'
  ) then
    update public.unidades set categoria = 'camion' where categoria = 'con_hidrogrua';
    alter type public.categoria_unidad rename to categoria_unidad_old;
    create type public.categoria_unidad as enum ('camion', 'tractor', 'volcador', 'chasis', 'otro');
    alter table public.unidades alter column categoria drop default;
    alter table public.unidades
      alter column categoria type public.categoria_unidad using categoria::text::public.categoria_unidad;
    alter table public.unidades alter column categoria set default 'camion';
    drop type public.categoria_unidad_old;
  end if;
end $$;
