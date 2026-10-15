-- Permite cargar unidades sin año (algunos posteos de Instagram no lo indican).
-- Si creaste la base con la versión nueva del esquema inicial, esto no cambia nada.
alter table public.unidades alter column anio drop not null;
