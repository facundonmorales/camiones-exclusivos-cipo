"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ExternalLink, Loader2, Pencil, Plus, Search, Star, Trash2, Truck } from "lucide-react";
import { actualizarUnidadRapido, borrarUnidad } from "@/app/admin/actions";
import { formatPrecio } from "@/lib/format";
import {
  CATEGORIAS,
  CATEGORIA_LABEL,
  CONDICIONES,
  CONDICION_LABEL,
  ESTADOS,
  ESTADO_LABEL,
  portada,
  type Estado,
  type Unidad,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { ConfirmDialog, inputCls } from "./ui";

const ESTADO_COLOR: Record<Estado, string> = {
  disponible: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  reservado: "bg-amber-50 text-amber-800 ring-amber-200",
  vendido: "bg-slate-100 text-slate-700 ring-slate-200",
};

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function UnidadesLista({
  inicial,
  errorCarga,
  filtroEstadoInicial,
  soloOcultasInicial,
}: {
  inicial: Unidad[];
  errorCarga: string | null;
  filtroEstadoInicial?: string;
  soloOcultasInicial?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(inicial);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [cond, setCond] = useState("");
  const [est, setEst] = useState(ESTADOS.includes(filtroEstadoInicial as Estado) ? filtroEstadoInicial! : "");
  const [soloOcultas, setSoloOcultas] = useState(Boolean(soloOcultasInicial));
  const [pendiente, setPendiente] = useState<string | null>(null);
  const [aBorrar, setABorrar] = useState<Unidad | null>(null);
  const [borrando, setBorrando] = useState(false);

  const filtradas = useMemo(() => {
    const t = normalizar(q.trim());
    return items.filter(
      (u) =>
        (!t || normalizar(`${u.titulo} ${u.marca} ${u.modelo} ${u.anio ?? ""} ${u.traccion ?? ""}`).includes(t)) &&
        (!cat || u.categoria === cat) &&
        (!cond || u.condicion === cond) &&
        (!est || u.estado === est) &&
        (!soloOcultas || !u.visible),
    );
  }, [items, q, cat, cond, est, soloOcultas]);

  async function cambiar(u: Unidad, cambios: Partial<Pick<Unidad, "estado" | "visible" | "destacada">>, ok: string) {
    const anterior = items;
    setItems((prev) => prev.map((i) => (i.id === u.id ? { ...i, ...cambios } : i)));
    setPendiente(u.id);
    const res = await actualizarUnidadRapido(u.id, cambios);
    setPendiente(null);
    if (!res.ok) {
      setItems(anterior);
      toast.error(res.error);
    } else {
      toast.success(ok);
      router.refresh();
    }
  }

  async function confirmarBorrado() {
    if (!aBorrar) return;
    setBorrando(true);
    const res = await borrarUnidad(aBorrar.id);
    setBorrando(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== aBorrar.id));
    toast.success(`"${aBorrar.titulo}" se borró`);
    setABorrar(null);
    router.refresh();
  }

  const hayFiltros = q || cat || cond || est || soloOcultas;

  const acciones = (u: Unidad) => {
    const ocupado = pendiente === u.id;
    return (
      <div className="flex items-center gap-1">
        <select
          aria-label={`Estado de ${u.titulo}`}
          value={u.estado}
          disabled={ocupado}
          onChange={(e) => {
            const nuevo = e.target.value as Estado;
            cambiar(u, { estado: nuevo }, `Marcada como ${ESTADO_LABEL[nuevo].toLowerCase()}`);
          }}
          className={cn(
            "h-9 rounded-lg px-2 text-sm font-medium ring-1 outline-none focus:ring-2 focus:ring-brand disabled:opacity-60",
            ESTADO_COLOR[u.estado],
          )}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABEL[e]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={ocupado}
          onClick={() => cambiar(u, { visible: !u.visible }, u.visible ? "Unidad oculta en la web" : "Unidad visible en la web")}
          aria-label={u.visible ? `Ocultar ${u.titulo}` : `Mostrar ${u.titulo}`}
          title={u.visible ? "Visible en la web (tocar para ocultar)" : "Oculta (tocar para mostrar)"}
          className={cn(
            "grid size-9 place-items-center rounded-lg transition hover:bg-mist disabled:opacity-50",
            u.visible ? "text-ink/70" : "bg-mist text-ink/40",
          )}
        >
          {u.visible ? <Eye className="size-[18px]" /> : <EyeOff className="size-[18px]" />}
        </button>
        <button
          type="button"
          disabled={ocupado}
          onClick={() => cambiar(u, { destacada: !u.destacada }, u.destacada ? "Ya no está destacada" : "Marcada como destacada")}
          aria-label={u.destacada ? `Quitar destacada a ${u.titulo}` : `Destacar ${u.titulo}`}
          aria-pressed={u.destacada}
          title={u.destacada ? "Destacada (aparece primero)" : "Marcar como destacada"}
          className={cn(
            "grid size-9 place-items-center rounded-lg transition hover:bg-mist disabled:opacity-50",
            u.destacada ? "text-amber-500" : "text-ink/35",
          )}
        >
          <Star className={cn("size-[18px]", u.destacada && "fill-current")} />
        </button>
        {ocupado && <Loader2 className="size-4 animate-spin text-ink/40" aria-label="Guardando" />}
      </div>
    );
  };

  const miniatura = (u: Unidad, className: string) => {
    const f = portada(u);
    return (
      <div className={cn("relative shrink-0 overflow-hidden rounded-lg bg-mist", className)}>
        {f ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Truck className="absolute inset-0 m-auto size-6 text-ink/25" aria-hidden="true" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Unidades</h1>
          <p className="mt-1 text-ink/60">
            {filtradas.length} de {items.length} {items.length === 1 ? "unidad" : "unidades"}
          </p>
        </div>
        <Link
          href="/admin/unidades/nueva"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark"
        >
          <Plus className="size-5" aria-hidden="true" />
          Cargar unidad
        </Link>
      </div>

      {errorCarga && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
          {errorCarga}
        </p>
      )}

      <div className="grid gap-2 rounded-2xl bg-white p-3 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por marca, modelo, año…"
            aria-label="Buscar unidades"
            className={inputCls(false) + " pl-10"}
          />
        </div>
        <select aria-label="Filtrar por categoría" value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls(false)}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {CATEGORIA_LABEL[c]}
            </option>
          ))}
        </select>
        <select aria-label="Filtrar por condición" value={cond} onChange={(e) => setCond(e.target.value)} className={inputCls(false)}>
          <option value="">Usados y 0 km</option>
          {CONDICIONES.map((c) => (
            <option key={c} value={c}>
              {CONDICION_LABEL[c]}
            </option>
          ))}
        </select>
        <select aria-label="Filtrar por estado" value={est} onChange={(e) => setEst(e.target.value)} className={inputCls(false)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABEL[e]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium">
          <input type="checkbox" checked={soloOcultas} onChange={(e) => setSoloOcultas(e.target.checked)} className="size-4 accent-brand" />
          Solo ocultas
        </label>
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
          <Truck className="mx-auto size-10 text-ink/25" aria-hidden="true" />
          <p className="mt-3 font-semibold">{items.length === 0 ? "Todavía no cargaste unidades" : "No hay unidades con esos filtros"}</p>
          {items.length === 0 ? (
            <Link href="/admin/unidades/nueva" className="mt-4 inline-block font-semibold text-brand hover:underline">
              Cargar la primera unidad
            </Link>
          ) : (
            hayFiltros && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setCat("");
                  setCond("");
                  setEst("");
                  setSoloOcultas(false);
                }}
                className="mt-4 font-semibold text-brand hover:underline"
              >
                Limpiar filtros
              </button>
            )
          )}
        </div>
      ) : (
        <>
          {/* Celular: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {filtradas.map((u) => (
              <li key={u.id} className={cn("rounded-2xl bg-white p-3 ring-1 ring-line", !u.visible && "opacity-75")}>
                <Link href={`/admin/unidades/${u.id}`} className="flex gap-3">
                  {miniatura(u, "h-[72px] w-24")}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{u.titulo}</p>
                    <p className="text-sm text-ink/55">
                      {[u.anio, formatPrecio(u.precio, u.moneda)].filter(Boolean).join(" · ")}
                    </p>
                    {!u.visible && <p className="mt-1 text-xs font-medium text-ink/50">Oculta en la web</p>}
                  </div>
                  <Pencil className="size-4 shrink-0 text-ink/35" aria-hidden="true" />
                </Link>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  {acciones(u)}
                  <button
                    type="button"
                    onClick={() => setABorrar(u)}
                    aria-label={`Borrar ${u.titulo}`}
                    className="grid size-9 place-items-center rounded-lg text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="size-[18px]" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Escritorio: tabla */}
          <div className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/60 text-xs text-ink/55">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Unidad</th>
                  <th scope="col" className="px-4 py-3 font-medium">Año</th>
                  <th scope="col" className="px-4 py-3 font-medium">Precio</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado · Visible · Destacada</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtradas.map((u) => (
                  <tr key={u.id} className={cn("hover:bg-mist/50", !u.visible && "text-ink/55")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {miniatura(u, "h-12 w-16")}
                        <div className="min-w-0">
                          <Link href={`/admin/unidades/${u.id}`} className="block max-w-[280px] truncate font-semibold hover:text-brand">
                            {u.titulo}
                          </Link>
                          <span className="text-xs text-ink/50">
                            {CATEGORIA_LABEL[u.categoria]} · {CONDICION_LABEL[u.condicion]}
                            {!u.visible && " · Oculta"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{u.anio ?? "—"}</td>
                    <td className="px-4 py-3 font-medium tabular-nums">{formatPrecio(u.precio, u.moneda)}</td>
                    <td className="px-4 py-3">
                      {acciones(u)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/vista-previa/${u.id}`}
                          target="_blank"
                          aria-label={`Vista previa de ${u.titulo}`}
                          title="Vista previa"
                          className="grid size-9 place-items-center rounded-lg text-ink/60 transition hover:bg-mist hover:text-ink"
                        >
                          <ExternalLink className="size-[18px]" />
                        </Link>
                        <Link
                          href={`/admin/unidades/${u.id}`}
                          aria-label={`Editar ${u.titulo}`}
                          title="Editar"
                          className="grid size-9 place-items-center rounded-lg text-ink/60 transition hover:bg-mist hover:text-ink"
                        >
                          <Pencil className="size-[18px]" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setABorrar(u)}
                          aria-label={`Borrar ${u.titulo}`}
                          title="Borrar"
                          className="grid size-9 place-items-center rounded-lg text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="size-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <BorrarUnidadDialog
        unidad={aBorrar}
        borrando={borrando}
        onCerrar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
        onAlternativa={(cambios, msg) => {
          if (!aBorrar) return;
          cambiar(aBorrar, cambios, msg);
          setABorrar(null);
        }}
      />
    </div>
  );
}

export function BorrarUnidadDialog({
  unidad,
  borrando,
  onCerrar,
  onConfirmar,
  onAlternativa,
}: {
  unidad: Pick<Unidad, "titulo" | "estado" | "visible"> | null;
  borrando: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
  onAlternativa: (cambios: { estado?: Estado; visible?: boolean }, mensaje: string) => void;
}) {
  return (
    <ConfirmDialog
      abierto={Boolean(unidad)}
      titulo={`¿Borrar "${unidad?.titulo ?? ""}"?`}
      descripcion="Esta acción no se puede deshacer. Se borran la unidad y todas sus fotos."
      confirmar="Borrar definitivamente"
      cargando={borrando}
      onCerrar={onCerrar}
      onConfirmar={onConfirmar}
    >
      {unidad && (unidad.estado !== "vendido" || unidad.visible) && (
        <div className="mt-5 rounded-xl bg-mist p-4 text-sm">
          <p className="text-ink/70">Si solo querés sacarla de la web, podés hacer esto en su lugar:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {unidad.estado !== "vendido" && (
              <button
                type="button"
                disabled={borrando}
                onClick={() => onAlternativa({ estado: "vendido" }, "Marcada como vendida")}
                className="rounded-lg bg-white px-3 py-2 font-semibold ring-1 ring-line transition hover:ring-ink/30"
              >
                Marcar como vendida
              </button>
            )}
            {unidad.visible && (
              <button
                type="button"
                disabled={borrando}
                onClick={() => onAlternativa({ visible: false }, "Unidad oculta en la web")}
                className="rounded-lg bg-white px-3 py-2 font-semibold ring-1 ring-line transition hover:ring-ink/30"
              >
                Ocultar de la web
              </button>
            )}
          </div>
        </div>
      )}
    </ConfirmDialog>
  );
}
