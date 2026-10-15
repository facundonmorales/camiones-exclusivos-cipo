import Link from "next/link";
import { Logo } from "@/components/Logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { SITE, direccionCompleta } from "@/lib/config";
import { mensajes, waLink } from "@/lib/whatsapp";

export function Footer() {
  const anio = new Date().getFullYear();
  const redes = [
    { href: SITE.redes.instagram, label: "Instagram", Icono: InstagramIcon },
    { href: SITE.redes.facebook, label: "Facebook", Icono: FacebookIcon },
    { href: waLink(mensajes.general()), label: "WhatsApp", Icono: WhatsAppIcon },
  ];

  return (
    <footer className="bg-ink pb-[calc(2rem+env(safe-area-inset-bottom))] pt-16 text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo tamano={112} conTexto={false} />
            <p className="mt-5 max-w-sm text-white/55">{SITE.frase}</p>
            <ul className="mt-6 flex gap-2">
              {redes.map(({ href, label, Icono }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-xl bg-white/5 text-white/75 ring-1 ring-white/10 transition hover:bg-brand hover:text-white hover:ring-brand"
                  >
                    <Icono className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white/45">Contacto</h2>
            <ul className="mt-4 space-y-2.5 text-[15px] text-white/80">
              <li>{direccionCompleta()}</li>
              <li>
                <a href={`tel:${SITE.telefonoE164}`} className="hover:text-white">{SITE.telefono}</a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="break-all hover:text-white">{SITE.email}</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white/45">Horarios</h2>
            <ul className="mt-4 space-y-2.5 text-[15px] text-white/80">
              {SITE.horarios.map((h) => (
                <li key={h.dias}>
                  {h.dias}: {h.horas}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {anio} {SITE.razonSocial}. Todos los derechos reservados.</p>
          <Link href="/admin" className="w-fit text-white/25 transition hover:text-white/60" rel="nofollow">
            Administración
          </Link>
        </div>
      </div>
    </footer>
  );
}
