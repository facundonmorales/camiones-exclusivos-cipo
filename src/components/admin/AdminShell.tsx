"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LayoutDashboard, LogOut, Truck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cerrarSesion } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Resumen", icono: LayoutDashboard, exacto: true },
  { href: "/admin/unidades", label: "Unidades", icono: Truck },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const activo = (href: string, exacto?: boolean) => (exacto ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-svh bg-mist">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink pt-[env(safe-area-inset-top)] text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <Link href="/admin" aria-label="Panel, inicio" className="rounded-lg">
            <Logo />
          </Link>
          <nav aria-label="Panel" className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, icono: Icono, exacto }) => (
              <Link
                key={href}
                href={href}
                aria-current={activo(href, exacto) ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  activo(href, exacto) ? "bg-white/10 text-white" : "text-white/65 hover:text-white",
                )}
              >
                <Icono className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:text-white"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Ver web</span>
              <span className="sr-only sm:hidden">Ver web pública</span>
            </a>
            <form action={cerrarSesion}>
              <button
                type="submit"
                title={`Cerrar sesión (${email})`}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:text-white"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Salir</span>
                <span className="sr-only sm:hidden">Cerrar sesión</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 sm:pt-8 md:pb-16">{children}</main>

      {/* Navegación inferior en celular */}
      <nav
        aria-label="Panel"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {NAV.map(({ href, label, icono: Icono, exacto }) => (
          <Link
            key={href}
            href={href}
            aria-current={activo(href, exacto) ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-xs font-medium",
              activo(href, exacto) ? "text-brand" : "text-ink/55",
            )}
          >
            <Icono className="size-5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
