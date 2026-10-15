"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { WhatsAppIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { mensajes, waLink } from "@/lib/whatsapp";

const LINKS = [
  { href: "/#unidades", label: "Unidades" },
  { href: "/#contacto", label: "Contacto" },
];

export function Header() {
  const pathname = usePathname();
  const sobreHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setAbierto(false), [pathname]);

  const solido = !sobreHero || scrolled || abierto;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-300",
        solido ? "border-b border-white/10 bg-ink/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:h-[72px] sm:px-8">
        <Link href="/" aria-label="Camiones Exclusivos, ir al inicio" className="rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-4 py-2 text-[15px] font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={waLink(mensajes.general())}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a72ff] active:scale-[0.97] sm:px-4"
          >
            <WhatsAppIcon className="size-4" />
            <span className="hidden sm:inline">WhatsApp</span>
            <span className="sr-only sm:hidden">Escribinos por WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className="grid size-10 place-items-center rounded-xl text-white transition hover:bg-white/10 md:hidden"
          >
            {abierto ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <nav
        id="menu-movil"
        aria-label="Menú móvil"
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 md:hidden",
          abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <ul className="min-h-0 px-5">
          {LINKS.map((l) => (
            <li key={l.href} className="border-t border-white/10 first:border-t-0">
              <Link
                href={l.href}
                onClick={() => setAbierto(false)}
                tabIndex={abierto ? 0 : -1}
                className="block py-4 font-display text-xl font-semibold text-white"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="pb-5" />
        </ul>
      </nav>
    </header>
  );
}
