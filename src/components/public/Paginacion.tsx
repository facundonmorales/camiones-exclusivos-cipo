"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Números a mostrar: 1 … 4 5 6 … 12 (con "…" cuando hay muchas páginas). */
function numeros(total: number, desde: number, hasta: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const visibles = new Set([1, total, desde - 1, desde, hasta, hasta + 1]);
  const lista = [...visibles].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const salida: (number | "…")[] = [];
  lista.forEach((n, i) => {
    if (i > 0 && n - lista[i - 1] > 1) salida.push("…");
    salida.push(n);
  });
  return salida;
}

/**
 * Paginación numerada. `desde`–`hasta` es el rango de páginas que se están
 * mostrando (con "Ver más" puede ser más de una página a la vez).
 */
export function Paginacion({
  total,
  desde,
  hasta,
  onIr,
}: {
  total: number;
  desde: number;
  hasta: number;
  onIr: (pagina: number) => void;
}) {
  if (total <= 1) return null;
  const btn =
    "grid h-11 min-w-11 place-items-center rounded-xl px-3 text-sm font-semibold tabular-nums transition disabled:pointer-events-none disabled:opacity-35";

  return (
    <nav aria-label="Páginas del catálogo" className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onIr(desde - 1)}
        disabled={desde <= 1}
        aria-label="Página anterior"
        className={cn(btn, "border border-line bg-white hover:border-ink/30")}
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="px-3 text-sm font-medium tabular-nums text-ink/70 sm:hidden" aria-current="page">
        Página {desde === hasta ? desde : `${desde}–${hasta}`} de {total}
      </span>
      <div className="hidden items-center gap-1.5 sm:flex">
      {numeros(total, desde, hasta).map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="px-1 text-ink/40" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onIr(n)}
            aria-label={`Página ${n}`}
            aria-current={n >= desde && n <= hasta ? "page" : undefined}
            className={cn(
              btn,
              n >= desde && n <= hasta
                ? "bg-ink text-white"
                : "border border-line bg-white text-ink/75 hover:border-ink/30 hover:text-ink",
            )}
          >
            {n}
          </button>
        ),
      )}
      </div>
      <button
        type="button"
        onClick={() => onIr(hasta + 1)}
        disabled={hasta >= total}
        aria-label="Página siguiente"
        className={cn(btn, "border border-line bg-white hover:border-ink/30")}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
