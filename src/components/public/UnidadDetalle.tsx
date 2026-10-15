import Link from "next/link";
import { BadgeCheck, CalendarClock, ChevronLeft, CircleDollarSign, Repeat, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { SITE } from "@/lib/config";
import { formatKm, formatPrecio } from "@/lib/format";
import { CATEGORIA_LABEL, CONDICION_LABEL, fotosOrdenadas, nombreCompleto, type Unidad } from "@/lib/types";
import { cn } from "@/lib/utils";
import { mensajes, waLink } from "@/lib/whatsapp";
import { Badge, UnidadCard } from "./UnidadCard";
import { Galeria } from "./Galeria";

export function UnidadDetalle({ unidad: u, otras }: { unidad: Unidad; otras: Unidad[] }) {
  const fotos = fotosOrdenadas(u);
  const url = `${SITE.url}/unidades/${u.slug}`;
  const vendido = u.estado === "vendido";

  const condiciones = [
    u.acepta_financiacion && { icono: CircleDollarSign, texto: "Acepta financiación" },
    u.acepta_canje && { icono: Repeat, texto: "Acepta canje" },
    u.entrega_inmediata && { icono: CalendarClock, texto: "Entrega inmediata" },
  ].filter(Boolean) as { icono: typeof Truck; texto: string }[];

  const ficha: [string, string][] = [
    ["Marca", u.marca],
    ["Modelo", u.modelo],
    ...(u.anio ? ([["Año", String(u.anio)]] as [string, string][]) : []),
    ["Condición", CONDICION_LABEL[u.condicion]],
    ["Tipo", CATEGORIA_LABEL[u.categoria]],
    ...(u.km != null ? ([["Kilometraje", formatKm(u.km)!]] as [string, string][]) : []),
    ...(u.traccion ? ([["Tracción", u.traccion]] as [string, string][]) : []),
    ...(u.especificaciones ?? [])
      .filter((e) => !["marca", "modelo", "año", "tracción"].includes(e.clave.trim().toLowerCase()))
      .map((e) => [e.clave, e.valor] as [string, string]),
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 sm:px-8 sm:pt-28">
        <nav aria-label="Ruta de navegación" className="mb-6 flex items-center gap-1 text-sm text-ink/55">
          <Link href="/#unidades" className="inline-flex items-center gap-1 rounded-md py-1 pr-2 transition hover:text-ink">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Todas las unidades
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Galeria fotos={fotos} titulo={nombreCompleto(u)} atenuada={vendido} />
          </div>

          <aside className="lg:col-span-5 lg:row-span-2">
            <div className="lg:sticky lg:top-28">
              <div className="flex flex-wrap gap-1.5">
                {u.condicion === "0km" ? (
                  <Badge className="bg-brand text-white">0 km</Badge>
                ) : (
                  <Badge className="bg-mist text-ink">Usado</Badge>
                )}
                <Badge className="bg-mist text-ink">{CATEGORIA_LABEL[u.categoria]}</Badge>
                {u.estado === "reservado" && <Badge className="bg-amber-400 text-ink">Reservado</Badge>}
                {vendido && <Badge className="bg-ink text-white">Vendido</Badge>}
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
                {u.titulo}
              </h1>
              <p className="mt-2 text-ink/60">
                {[u.anio ? String(u.anio) : null, formatKm(u.km), u.traccion].filter(Boolean).join(" · ")}
              </p>

              <div className="mt-6 rounded-2xl bg-mist p-6 ring-1 ring-line">
                <p className="text-sm text-ink/55">
                  {vendido ? "Esta unidad ya fue vendida" : u.precio == null ? "Precio" : `Precio en ${u.moneda === "USD" ? "dólares" : "pesos"}`}
                </p>
                <p className={cn("mt-1 font-display text-4xl font-bold tracking-tight", vendido && "text-ink/40")}>
                  {vendido ? "Vendido" : formatPrecio(u.precio, u.moneda)}
                </p>

                {condiciones.length > 0 && !vendido && (
                  <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                    {condiciones.map(({ icono: Icono, texto }) => (
                      <li key={texto} className="flex items-center gap-2.5 font-medium">
                        <Icono className="size-5 text-brand" aria-hidden="true" />
                        {texto}
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href={waLink(vendido ? mensajes.busqueda() : mensajes.unidad(nombreCompleto(u), url))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgb(30_94_255/0.9)] transition hover:bg-brand-dark"
                >
                  <WhatsAppIcon className="size-5" />
                  {vendido ? "Buscar una unidad similar" : "Consultar por WhatsApp"}
                </a>
                <a
                  href={waLink(mensajes.visita())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 flex w-full items-center justify-center rounded-xl border border-ink/15 bg-white px-6 py-3.5 font-semibold transition hover:border-ink"
                >
                  Coordinar visita
                </a>
              </div>

              <p className="mt-4 flex items-start gap-2 text-sm text-ink/55">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                Podés verla en {SITE.direccion.calle}, {SITE.direccion.localidad}.
              </p>
            </div>
          </aside>

          <div className="space-y-10 lg:col-span-7">
            <section aria-labelledby="ficha-titulo">
              <h2 id="ficha-titulo" className="font-display text-2xl font-semibold tracking-tight">
                Ficha técnica
              </h2>
              <dl className="mt-4 overflow-hidden rounded-2xl ring-1 ring-line">
                {ficha.map(([k, v], i) => (
                  <div key={`${k}-${i}`} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-3.5 odd:bg-mist">
                    <dt className="text-ink/55">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {u.descripcion && (
              <section aria-labelledby="desc-titulo">
                <h2 id="desc-titulo" className="font-display text-2xl font-semibold tracking-tight">
                  Descripción
                </h2>
                <p className="mt-4 max-w-[68ch] whitespace-pre-line text-[17px] leading-relaxed text-ink/75">{u.descripcion}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {otras.length > 0 && (
        <section aria-labelledby="otras-titulo" className="bg-mist py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 id="otras-titulo" className="font-display text-3xl font-bold tracking-tight">
                Otras unidades
              </h2>
              <Link href="/#unidades" className="text-sm font-semibold text-brand hover:underline">
                Ver todas
              </Link>
            </div>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {otras.map((o) => (
                <li key={o.id}>
                  <UnidadCard unidad={o} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
