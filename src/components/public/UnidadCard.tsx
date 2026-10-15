import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import { formatKm, formatPrecio } from "@/lib/format";
import { nombreCompleto, portada, type UnidadTarjeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold leading-none", className)}>
      {children}
    </span>
  );
}

export function UnidadCard({ unidad: u, prioridad = false }: { unidad: UnidadTarjeta; prioridad?: boolean }) {
  const foto = portada(u);
  const vendido = u.estado === "vendido";
  const datos = [u.anio ? String(u.anio) : null, formatKm(u.km), u.traccion].filter(Boolean) as string[];

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line transition duration-300",
        !vendido && "hover:-translate-y-1 hover:shadow-card-hover",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        {foto ? (
          <Image
            src={foto.url}
            alt={nombreCompleto(u)}
            fill
            priority={prioridad}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover transition duration-700 group-hover:scale-[1.04]",
              vendido && "opacity-55 grayscale",
            )}
          />
        ) : (
          <FotoPlaceholder className={cn(vendido && "opacity-60")} />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {u.condicion === "0km" ? (
            <Badge className="bg-brand text-white">0 km</Badge>
          ) : (
            <Badge className="bg-white/95 text-ink shadow-sm">Usado</Badge>
          )}
          {u.acepta_financiacion && !vendido && <Badge className="bg-ink/85 text-white backdrop-blur">Financiación</Badge>}
        </div>

        {u.destacada && !vendido && (
          <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/95 text-brand shadow-sm">
            <Star className="size-4 fill-current" aria-hidden="true" />
            <span className="sr-only">Unidad destacada</span>
          </span>
        )}

        {u.estado !== "disponible" && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 px-4 py-2 text-center text-sm font-bold uppercase tracking-[0.14em]",
              vendido ? "bg-ink text-white" : "bg-amber-400 text-ink",
            )}
          >
            {vendido ? "Vendido" : "Reservado"}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <ul className="flex flex-wrap gap-1.5" aria-label="Datos principales">
          {datos.map((d) => (
            <li key={d} className="rounded-md bg-mist px-2 py-1 text-xs font-medium text-ink/70">
              {d}
            </li>
          ))}
        </ul>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight">
          <Link href={`/unidades/${u.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {u.titulo}
          </Link>
        </h3>
        {u.descripcion_corta && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/60">{u.descripcion_corta}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            <p className="text-xs text-ink/50">{u.precio == null ? "Precio" : u.moneda === "USD" ? "Dólares" : "Pesos"}</p>
            <p className={cn("break-words font-display text-xl font-bold tracking-tight", vendido ? "text-ink/40" : "text-ink")}>
              {vendido ? "Vendido" : formatPrecio(u.precio, u.moneda)}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-brand"
          >
            Ver unidad
            <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
      {/* Anillo de foco visible para el link que cubre toda la tarjeta */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-brand ring-offset-2 group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}
