import { WhatsAppIcon } from "@/components/icons";
import { mensajes, waLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

export function CtaBanda() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-[#1747c9] to-brand-dark px-7 py-14 text-white sm:px-14 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(115deg,#fff_0_2px,transparent_2px_26px)]"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                ¿No encontrás el camión que buscás?
              </h2>
              <p className="mt-3 text-lg text-white/80">Decinos qué necesitás y te lo conseguimos.</p>
            </div>
            <a
              href={waLink(mensajes.busqueda())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-4 text-base font-semibold text-ink shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <WhatsAppIcon className="size-5 text-[#1fa855]" />
              Escribinos
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
