import { UnidadesLista } from "@/components/admin/UnidadesLista";
import { ordenarUnidades, SELECT_UNIDAD } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Unidad } from "@/lib/types";

export const metadata = { title: "Unidades" };

export default async function UnidadesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; visible?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from("unidades").select(SELECT_UNIDAD);
  const unidades = ordenarUnidades((data ?? []) as Unidad[]);

  return (
    <UnidadesLista
      inicial={unidades}
      errorCarga={error ? "No se pudieron cargar las unidades. Recargá la página." : null}
      filtroEstadoInicial={sp.estado}
      soloOcultasInicial={sp.visible === "ocultas"}
    />
  );
}
