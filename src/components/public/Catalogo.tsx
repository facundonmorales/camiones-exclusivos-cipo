"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SearchX } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import type { UnidadTarjeta } from "@/lib/types";
import { cn } from "@/lib/utils";
import { mensajes, waLink } from "@/lib/whatsapp";
import { Paginacion } from "./Paginacion";
import { Reveal } from "./Reveal";
import { UnidadCard } from "./UnidadCard";

/** Unidades por página. 12 se reparte parejo en 1, 2 y 3 columnas. */
const POR_PAGINA = 12;

const FILTROS = [
  { id: "todas", label: "Todas" },
  { id: "camion", label: "Camiones" },
  { id: "tractor", label: "Tractores" },
  { id: "volcador", label: "Volcadores" },
  { id: "chasis", label: "Chasis" },
  { id: "0km", label: "0 km" },
] as const;
type FiltroId = (typeof FILTROS)[number]["id"];
const esFiltro = (v: string | null): v is FiltroId => FILTROS.some((f) => f.id === v);

function coincide(u: UnidadTarjeta, f: FiltroId) {
  if (f === "todas") return true;
  if (f === "0km") return u.condicion === "0km";
  return u.categoria === f;
}

/** Guarda filtro y página en la URL (?tipo=tractor&pagina=2) sin recargar,
 *  así al volver desde una unidad o al compartir el link se ve lo mismo. */
function guardarEnUrl(filtro: FiltroId, desde: number, hasta: number) {
  const url = new URL(window.location.href);
  if (filtro === "todas") url.searchParams.delete("tipo");
  else url.searchParams.set("tipo", filtro);
  if (desde === 1 && hasta === 1) url.searchParams.delete("pagina");
  else url.searchParams.set("pagina", desde === hasta ? String(desde) : `${desde}-${hasta}`);
  window.history.replaceState(window.history.state, "", url);
}

export function Catalogo({ unidades }: { unidades: UnidadTarjeta[] }) {
  const [filtro, setFiltro] = useState<FiltroId>("todas");
  // Rango de páginas visibles: "Ver más" agranda `hasta`; un número de página los iguala.
  const [rango, setRango] = useState({ desde: 1, hasta: 1 });
  const [enfocar, setEnfocar] = useState<number | null>(null);
  const [listo, setListo] = useState(false);
  const seccionRef = useRef<HTMLElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const lista = useMemo(() => unidades.filter((u) => coincide(u, filtro)), [unidades, filtro]);
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const desde = Math.min(rango.desde, totalPaginas);
  const hasta = Math.min(Math.max(rango.hasta, desde), totalPaginas);
  const inicio = (desde - 1) * POR_PAGINA;
  const fin = Math.min(hasta * POR_PAGINA, lista.length);
  const visibles = lista.slice(inicio, fin);
  const restantes = lista.length - fin;
  const disponibles = lista.filter((u) => u.estado === "disponible").length;

  // Leer filtro y página de la URL al entrar
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const tipo = p.get("tipo");
    if (esFiltro(tipo)) setFiltro(tipo);
    const m = (p.get("pagina") ?? "").match(/^(\d+)(?:-(\d+))?$/);
    if (m) {
      const a = Math.max(1, Number(m[1]));
      setRango({ desde: a, hasta: Math.max(a, Number(m[2] ?? a)) });
    }
    setListo(true);
  }, []);

  useEffect(() => {
    if (listo) guardarEnUrl(filtro, desde, hasta);
  }, [listo, filtro, desde, hasta]);

  // Después de "Ver más", el foco va a la primera unidad nueva (navegación con teclado).
  useEffect(() => {
    if (enfocar == null) return;
    listaRef.current?.querySelector<HTMLAnchorElement>(`[data-indice="${enfocar}"] a`)?.focus({ preventScroll: true });
    setEnfocar(null);
  }, [enfocar, visibles.length]);

  const cambiarFiltro = (f: FiltroId) => {
    setFiltro(f);
    setRango({ desde: 1, hasta: 1 });
  };

  const verMas = () => {
    setEnfocar(fin);
    setRango({ desde, hasta: hasta + 1 });
  };

  const irAPagina = useCallback((n: number) => {
    setRango({ desde: n, hasta: n });
    const el = seccionRef.current;
    if (el) {
      const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });
    }
  }, []);

  return (
    <section ref={seccionRef} id="unidades" aria-labelledby="unidades-titulo" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="unidades-titulo" className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Unidades disponibles
              </h2>
              <p className="mt-3 text-lg text-ink/60">Camiones usados y 0 km, listos para trabajar</p>
            </div>
            <p className="text-sm text-ink/60" aria-live="polite">
              <span className="font-display text-2xl font-bold text-ink">{disponibles}</span>{" "}
              {disponibles === 1 ? "unidad disponible" : "unidades disponibles"}
            </p>
          </div>
        </Reveal>

        <div className="-mx-5 mt-8 sm:mx-0">
          <div role="group" aria-label="Filtrar por tipo" className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1 sm:flex-wrap sm:px-0">
            {FILTROS.map((f) => {
              const activo = f.id === filtro;
              const cantidad = unidades.filter((u) => coincide(u, f.id)).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => cambiarFiltro(f.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[0.97]",
                    activo
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-ink/75 hover:border-ink/30 hover:text-ink",
                  )}
                >
                  {f.label}
                  <span className={cn("ml-1.5 tabular-nums", activo ? "text-white/60" : "text-ink/35")}>{cantidad}</span>
                </button>
              );
            })}
          </div>
        </div>

        {lista.length > 0 ? (
          <>
            <ul
              ref={listaRef}
              key={`${filtro}-${desde}`}
              className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {visibles.map((u, i) => {
                const indice = inicio + i;
                return (
                  <li
                    key={u.id}
                    data-indice={indice}
                    className="animate-fade-up"
                    style={{ animationDelay: `${Math.min(i % POR_PAGINA, 8) * 45}ms` }}
                  >
                    <UnidadCard unidad={u} prioridad={indice < 2} />
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 flex flex-col items-center gap-5">
              <p className="text-sm text-ink/55" aria-live="polite">
                Mostrando <span className="font-semibold text-ink tabular-nums">{inicio + 1}–{fin}</span> de{" "}
                <span className="font-semibold text-ink tabular-nums">{lista.length}</span> unidades
              </p>

              {restantes > 0 && (
                <button
                  type="button"
                  onClick={verMas}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-7 py-4 font-semibold text-white transition hover:bg-brand active:scale-[0.98] sm:w-auto"
                >
                  Ver más unidades
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-sm tabular-nums">
                    +{Math.min(restantes, POR_PAGINA)}
                  </span>
                  <ChevronDown className="size-4 transition group-hover:translate-y-0.5" aria-hidden="true" />
                </button>
              )}

              <Paginacion total={totalPaginas} desde={desde} hasta={hasta} onIr={irAPagina} />
            </div>
          </>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line bg-mist px-6 py-16 text-center">
            <SearchX className="size-10 text-ink/30" aria-hidden="true" />
            <h3 className="mt-4 font-display text-xl font-semibold">
              {unidades.length === 0 ? "Estamos cargando unidades nuevas" : "No hay unidades de este tipo por ahora"}
            </h3>
            <p className="mt-2 max-w-md text-ink/60">
              Contanos qué estás buscando y te avisamos cuando entre una unidad que te sirva.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              {filtro !== "todas" && (
                <button
                  type="button"
                  onClick={() => cambiarFiltro("todas")}
                  className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:border-ink/30"
                >
                  Ver todas las unidades
                </button>
              )}
              <a
                href={waLink(mensajes.busqueda())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                <WhatsAppIcon className="size-4" />
                Avisame por WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
