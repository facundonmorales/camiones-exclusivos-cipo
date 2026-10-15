import { SITE } from "./config";
import { getPublicClient } from "./supabase/public";
import type { Unidad } from "./types";

export const SELECT_UNIDAD = "*, unidad_fotos(id, unidad_id, url, storage_path, orden, es_portada)";

/** Destacadas primero, luego por "orden" (menor primero), luego más nuevas. Vendidas al final. */
export function ordenarUnidades<T extends Pick<Unidad, "estado" | "destacada" | "orden" | "created_at">>(lista: T[]) {
  return [...lista].sort((a, b) => {
    const va = a.estado === "vendido" ? 1 : 0;
    const vb = b.estado === "vendido" ? 1 : 0;
    if (va !== vb) return va - vb;
    if (a.destacada !== b.destacada) return a.destacada ? -1 : 1;
    if (a.orden !== b.orden) return a.orden - b.orden;
    return b.created_at.localeCompare(a.created_at);
  });
}

function filtrarVendidas(lista: Unidad[]) {
  if (!SITE.mostrarVendidos) return lista.filter((u) => u.estado !== "vendido");
  const limite = Date.now() - SITE.diasVendidosVisibles * 86_400_000;
  return lista.filter(
    (u) => u.estado !== "vendido" || (u.vendido_at != null && new Date(u.vendido_at).getTime() >= limite),
  );
}

export async function getUnidadesPublicas(): Promise<Unidad[]> {
  const supabase = getPublicClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from("unidades").select(SELECT_UNIDAD).eq("visible", true);
    if (error) throw error;
    return ordenarUnidades(filtrarVendidas((data ?? []) as Unidad[]));
  } catch (e) {
    console.error("[data] getUnidadesPublicas", e);
    return [];
  }
}

export async function getUnidadPorSlug(slug: string): Promise<Unidad | null> {
  const supabase = getPublicClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("unidades")
      .select(SELECT_UNIDAD)
      .eq("slug", slug)
      .eq("visible", true)
      .maybeSingle();
    if (error) throw error;
    return (data as Unidad | null) ?? null;
  } catch (e) {
    console.error("[data] getUnidadPorSlug", e);
    return null;
  }
}

export async function getOtrasUnidades(excluirId: string, cantidad = 3): Promise<Unidad[]> {
  const todas = await getUnidadesPublicas();
  return todas.filter((u) => u.id !== excluirId && u.estado !== "vendido").slice(0, cantidad);
}
