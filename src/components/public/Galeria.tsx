"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import type { UnidadFoto } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Galeria({ fotos, titulo, atenuada = false }: { fotos: UnidadFoto[]; titulo: string; atenuada?: boolean }) {
  const [actual, setActual] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const pista = useRef<HTMLDivElement>(null);
  const cerrarBtn = useRef<HTMLButtonElement>(null);
  const toque = useRef<number | null>(null);
  const total = fotos.length;

  const irA = useCallback(
    (i: number, suave = true) => {
      const n = (i + total) % total;
      setActual(n);
      const el = pista.current;
      if (el) el.scrollTo({ left: n * el.clientWidth, behavior: suave ? "smooth" : "auto" });
    },
    [total],
  );

  const onScroll = () => {
    const el = pista.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== actual) setActual(i);
  };

  useEffect(() => {
    if (!ampliada) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAmpliada(false);
      if (e.key === "ArrowRight") irA(actual + 1);
      if (e.key === "ArrowLeft") irA(actual - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [ampliada, actual, irA]);

  // Al cerrar la vista ampliada, sincronizamos el carrusel con la foto vista.
  useEffect(() => {
    if (!ampliada) irA(actual, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ampliada]);

  if (total === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist ring-1 ring-line">
        <FotoPlaceholder />
      </div>
    );
  }

  return (
    <div>
      <div className="group relative overflow-hidden rounded-2xl bg-ink ring-1 ring-line">
        <div
          ref={pista}
          onScroll={onScroll}
          className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto"
          aria-roledescription="carrusel"
          aria-label={`Fotos de ${titulo}`}
        >
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setActual(i);
                setAmpliada(true);
              }}
              className="relative h-full w-full shrink-0 snap-center snap-always"
              aria-label={`Ampliar foto ${i + 1} de ${total}`}
            >
              <Image
                src={f.url}
                alt={`${titulo}, foto ${i + 1} de ${total}`}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className={cn("object-cover", atenuada && "opacity-60 grayscale")}
              />
            </button>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => irA(actual - 1)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white sm:grid sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => irA(actual + 1)}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white sm:grid sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          <Expand className="size-3.5" aria-hidden="true" />
          <span aria-live="polite">
            {actual + 1} / {total}
          </span>
        </div>
      </div>

      {total > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {fotos.map((f, i) => (
            <li key={f.id} className="shrink-0">
              <button
                type="button"
                onClick={() => irA(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === actual}
                className={cn(
                  "relative block h-16 w-[86px] overflow-hidden rounded-lg ring-2 transition sm:h-[72px] sm:w-24",
                  i === actual ? "ring-brand" : "opacity-70 ring-transparent hover:opacity-100",
                )}
              >
                <Image src={f.url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {ampliada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${titulo}`}
          className="fixed inset-0 z-[70] flex flex-col bg-black/95 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-white"
          onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (toque.current == null) return;
            const dx = e.changedTouches[0].clientX - toque.current;
            if (Math.abs(dx) > 50) irA(actual + (dx < 0 ? 1 : -1));
            toque.current = null;
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-white/70">
              {actual + 1} / {total}
            </span>
            <button
              ref={cerrarBtn}
              type="button"
              onClick={() => setAmpliada(false)}
              aria-label="Cerrar"
              className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image
              key={fotos[actual].id}
              src={fotos[actual].url}
              alt={`${titulo}, foto ${actual + 1} de ${total}`}
              fill
              sizes="100vw"
              className="animate-fade-up object-contain"
            />
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => irA(actual - 1)}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-white/25"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => irA(actual + 1)}
                  aria-label="Foto siguiente"
                  className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-white/25"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>
          <div className="h-6" />
        </div>
      )}
    </div>
  );
}
