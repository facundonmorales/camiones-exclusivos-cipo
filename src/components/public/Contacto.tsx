import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { SITE, direccionCompleta, urlComoLlegar, urlMapaEmbebido } from "@/lib/config";
import { mensajes, waLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

export function Contacto() {
  const comoLlegar = urlComoLlegar();
  const mapa = urlMapaEmbebido();

  const filas = [
    {
      icono: MapPin,
      titulo: "Dirección",
      contenido: (
        <a href={SITE.maps.link} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
          {direccionCompleta()}
        </a>
      ),
    },
    {
      icono: Clock,
      titulo: "Horarios",
      contenido: SITE.horarios.map((h) => `${h.dias}: ${h.horas}`).join("\n"),
    },
    {
      icono: Phone,
      titulo: "Teléfono y WhatsApp",
      contenido: <a href={`tel:${SITE.telefonoE164}`} className="hover:text-brand">{SITE.telefono}</a>,
    },
    {
      icono: Mail,
      titulo: "Email",
      contenido: <a href={`mailto:${SITE.email}`} className="break-all hover:text-brand">{SITE.email}</a>,
    },
  ];

  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className="bg-mist py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
        <Reveal>
          <h2 id="contacto-titulo" className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Vení a ver las unidades
          </h2>
          <p className="mt-3 text-lg text-ink/60">Estamos sobre la Ruta 22, en la entrada de Cipolletti.</p>

          <dl className="mt-10 divide-y divide-line border-y border-line">
            {filas.map(({ icono: Icono, titulo, contenido }) => (
              <div key={titulo} className="flex gap-4 py-5">
                <Icono className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <dt className="text-sm text-ink/50">{titulo}</dt>
                  <dd className="mt-0.5 whitespace-pre-line font-medium">{contenido}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={waLink(mensajes.visita())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-dark"
            >
              <WhatsAppIcon className="size-5" />
              Coordinar visita
            </a>
            <a
              href={comoLlegar}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-6 py-3.5 font-semibold transition hover:border-ink"
            >
              <Navigation className="size-5" aria-hidden="true" />
              Cómo llegar
            </a>
          </div>
        </Reveal>

        <Reveal delay={120} className="min-h-[340px] scroll-mt-24 overflow-hidden rounded-2xl bg-line shadow-card ring-1 ring-line">
          <iframe
            id="mapa"
            title={`Mapa: ${direccionCompleta()}`}
            src={mapa}
            className="h-full min-h-[340px] w-full border-0 lg:min-h-[560px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </Reveal>
      </div>
    </section>
  );
}
