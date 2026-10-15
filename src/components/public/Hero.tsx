import Link from "next/link";
import { ArrowDownRight, Clock, MapPin, Route } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { SITE } from "@/lib/config";
import { mensajes, waLink } from "@/lib/whatsapp";
import { HeroVideo } from "./HeroVideo";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 -z-10 bg-ink">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/65 via-ink/25 to-brand-dark/80" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/70 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pb-24 sm:pt-36">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Cipolletti · Río Negro</p>
        <h1 className="mt-5 max-w-[14ch] font-display text-[clamp(2.75rem,9vw,6.75rem)] font-bold leading-[0.95] tracking-[-0.035em] text-balance">
          Camiones que trabajan tanto como vos
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/80 sm:text-xl">Usados y 0 km · Financiación · Entrega inmediata</p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#unidades"
            className="inline-flex items-center justify-center rounded-xl bg-brand px-7 py-4 text-base font-semibold text-white shadow-[0_12px_30px_-10px_rgb(30_94_255/0.8)] transition hover:-translate-y-0.5 hover:bg-[#3a72ff] active:translate-y-0"
          >
            Ver unidades
          </Link>
          <a
            href={waLink(mensajes.general())}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/60 px-7 py-4 text-base font-semibold text-white transition hover:border-white hover:bg-white hover:text-ink"
          >
            <WhatsAppIcon className="size-5" />
            Consultar por WhatsApp
          </a>
        </div>

        <dl className="mt-12 grid max-w-3xl gap-5 border-t border-white/15 pt-6 text-sm sm:mt-14 sm:grid-cols-3 sm:gap-8">
          <div className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/20 text-[#7ea2ff] ring-1 ring-brand/40">
              <MapPin className="size-[18px]" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-white/50">Dónde estamos</dt>
              <dd className="mt-0.5">
                <a
                  href="#mapa"
                  className="group inline-flex items-center gap-1 font-medium underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-brand"
                >
                  {SITE.direccion.calle}
                  <ArrowDownRight
                    className="size-4 text-white/50 transition group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:text-white"
                    aria-hidden="true"
                  />
                  <span className="sr-only"> (ver en el mapa)</span>
                </a>
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/20 text-[#7ea2ff] ring-1 ring-brand/40">
              <Route className="size-[18px]" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-white/50">Trabajamos en</dt>
              <dd className="mt-0.5 font-medium">Alto Valle y Vaca Muerta</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/20 text-[#7ea2ff] ring-1 ring-brand/40">
              <Clock className="size-[18px]" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-white/50">Atención</dt>
              <dd className="mt-0.5 font-medium">Lun a vie 9–18 · Sáb 9–13</dd>
            </div>
          </div>
        </dl>
      </div>
    </section>
  );
}
