"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BUCKET_FOTOS } from "@/lib/config";
import { slugify } from "@/lib/slug";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ESTADOS, type Estado } from "@/lib/types";
import { UUID_RE } from "@/lib/utils";
import { erroresPorCampo, unidadSchema, type UnidadInput } from "@/lib/validation";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

class ErrorVisible extends Error {}

type Supa = Awaited<ReturnType<typeof createSupabaseServer>>;

async function requireAdmin(): Promise<Supa> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new ErrorVisible("Tu sesión expiró. Volvé a iniciar sesión.");
  const { data: esAdmin } = await supabase.rpc("is_admin");
  if (!esAdmin) throw new ErrorVisible("Tu usuario no tiene permisos de administrador.");
  return supabase;
}

function fallo(e: unknown, generico = "No se pudo completar la acción. Intentá de nuevo."): { ok: false; error: string } {
  if (e instanceof ErrorVisible) return { ok: false, error: e.message };
  console.error("[admin]", e);
  return { ok: false, error: generico };
}

function revalidarPublico(slug?: string) {
  revalidatePath("/");
  if (slug) revalidatePath(`/unidades/${slug}`);
  revalidatePath("/unidades/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin", "layout");
}

/** Solo aceptamos URLs del bucket propio, dentro de la carpeta esperada. */
function prefijoPublico(carpeta: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_FOTOS}/${carpeta}/`;
}

async function slugUnico(supabase: Supa, texto: string) {
  const base = slugify(texto) || "unidad";
  const { data, error } = await supabase.from("unidades").select("slug").like("slug", `${base}%`);
  if (error) throw error;
  const usados = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!usados.has(base)) return base;
  let i = 2;
  while (usados.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// ─────────────────────────────── Unidades ───────────────────────────────

export type FotoPayload = { url: string; path: string | null; es_portada: boolean };

export async function guardarUnidad(payload: {
  id: string;
  nueva: boolean;
  datos: UnidadInput;
  fotos: FotoPayload[];
  fotosEliminadas: string[];
}): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = await requireAdmin();
    if (!UUID_RE.test(payload.id)) return { ok: false, error: "Identificador de unidad inválido." };

    const parsed = unidadSchema.safeParse(payload.datos);
    if (!parsed.success) {
      return { ok: false, error: "Revisá los campos marcados.", fieldErrors: erroresPorCampo(parsed.error) };
    }
    const d = parsed.data;

    const carpeta = `unidades/${payload.id}`;
    const prefijo = prefijoPublico(carpeta);
    if (payload.fotos.length > 40) return { ok: false, error: "Máximo 40 fotos por unidad." };
    if (payload.fotos.some((f) => !f.url.startsWith(prefijo))) {
      return { ok: false, error: "Hay fotos con un origen no válido. Volvé a subirlas." };
    }

    let slug: string;
    if (payload.nueva) {
      slug = await slugUnico(supabase, [d.marca, d.modelo, d.anio].filter(Boolean).join(" "));
      const { error } = await supabase.from("unidades").insert({ id: payload.id, slug, ...d });
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("unidades").update(d).eq("id", payload.id).select("slug").single();
      if (error) throw error;
      slug = data.slug as string;
    }

    // Reemplazamos el listado de fotos con el orden y la portada actuales.
    const { error: errBorrar } = await supabase.from("unidad_fotos").delete().eq("unidad_id", payload.id);
    if (errBorrar) throw errBorrar;
    if (payload.fotos.length) {
      let portadaIdx = payload.fotos.findIndex((f) => f.es_portada);
      if (portadaIdx < 0) portadaIdx = 0;
      const filas = payload.fotos.map((f, i) => ({
        unidad_id: payload.id,
        url: f.url,
        storage_path: f.path && f.path.startsWith(`${carpeta}/`) ? f.path : null,
        orden: i,
        es_portada: i === portadaIdx,
      }));
      const { error } = await supabase.from("unidad_fotos").insert(filas);
      if (error) throw error;
    }

    const aBorrar = payload.fotosEliminadas.filter((p) => p.startsWith(`${carpeta}/`));
    if (aBorrar.length) {
      const { error } = await supabase.storage.from(BUCKET_FOTOS).remove(aBorrar);
      if (error) console.error("[admin] No se pudieron borrar fotos del Storage", error);
    }

    revalidarPublico(slug);
    return { ok: true, data: { id: payload.id, slug } };
  } catch (e) {
    return fallo(e, "No se pudo guardar la unidad. Intentá de nuevo.");
  }
}

export async function actualizarUnidadRapido(
  id: string,
  cambios: { estado?: Estado; visible?: boolean; destacada?: boolean },
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    if (!UUID_RE.test(id)) return { ok: false, error: "Unidad inválida." };
    const patch: Record<string, unknown> = {};
    if (cambios.estado !== undefined) {
      if (!ESTADOS.includes(cambios.estado)) return { ok: false, error: "Estado inválido." };
      patch.estado = cambios.estado;
    }
    if (typeof cambios.visible === "boolean") patch.visible = cambios.visible;
    if (typeof cambios.destacada === "boolean") patch.destacada = cambios.destacada;
    if (!Object.keys(patch).length) return { ok: false, error: "No hay cambios para guardar." };

    const { data, error } = await supabase.from("unidades").update(patch).eq("id", id).select("slug").single();
    if (error) throw error;
    revalidarPublico(data.slug as string);
    return { ok: true };
  } catch (e) {
    return fallo(e);
  }
}

export async function borrarUnidad(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    if (!UUID_RE.test(id)) return { ok: false, error: "Unidad inválida." };

    const carpeta = `unidades/${id}`;
    const [{ data: unidad }, { data: fotos }, { data: archivos }] = await Promise.all([
      supabase.from("unidades").select("slug").eq("id", id).maybeSingle(),
      supabase.from("unidad_fotos").select("storage_path").eq("unidad_id", id),
      supabase.storage.from(BUCKET_FOTOS).list(carpeta, { limit: 1000 }),
    ]);
    if (!unidad) return { ok: false, error: "La unidad ya no existe." };

    const rutas = new Set<string>();
    (fotos ?? []).forEach((f: { storage_path: string | null }) => f.storage_path && rutas.add(f.storage_path));
    (archivos ?? []).forEach((a) => rutas.add(`${carpeta}/${a.name}`));
    if (rutas.size) {
      const { error } = await supabase.storage.from(BUCKET_FOTOS).remove([...rutas]);
      if (error) throw new ErrorVisible("No se pudieron borrar las fotos. La unidad no se eliminó; intentá de nuevo.");
    }

    const { error } = await supabase.from("unidades").delete().eq("id", id);
    if (error) throw error;
    revalidarPublico(unidad.slug as string);
    return { ok: true };
  } catch (e) {
    return fallo(e, "No se pudo borrar la unidad. Intentá de nuevo.");
  }
}

// ─────────────────────────────── Sesión ────────────────────────────────

export async function cerrarSesion() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
