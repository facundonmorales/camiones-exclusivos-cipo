import Link from "next/link";
import { CircleDot, Clock3, EyeOff, Handshake, Plus, Truck } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ESTADO_LABEL, type Estado } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Resumen" };

type Fila = { id: string; titulo: string; anio: number | null; estado: Estado; visible: boolean; updated_at: string };

export default async function Dashboard() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("unidades")
    .select("id, titulo, anio, estado, visible, updated_at")
    .order("updated_at", { ascending: false });
  const unidades = (data ?? []) as Fila[];

  const stats = [
    { label: "Total", valor: unidades.length, icono: Truck, href: "/admin/unidades", tono: "text-ink" },
    { label: "Disponibles", valor: unidades.filter((u) => u.estado === "disponible").length, icono: CircleDot, href: "/admin/unidades?estado=disponible", tono: "text-emerald-600" },
    { label: "Reservadas", valor: unidades.filter((u) => u.estado === "reservado").length, icono: Clock3, href: "/admin/unidades?estado=reservado", tono: "text-amber-600" },
    { label: "Vendidas", valor: unidades.filter((u) => u.estado === "vendido").length, icono: Handshake, href: "/admin/unidades?estado=vendido", tono: "text-brand" },
    { label: "Ocultas", valor: unidades.filter((u) => !u.visible).length, icono: EyeOff, href: "/admin/unidades?visible=ocultas", tono: "text-ink/50" },
  ];
  const fecha = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Resumen</h1>
          <p className="mt-1 text-ink/60">Estado del catálogo publicado en la web.</p>
        </div>
        <Link
          href="/admin/unidades/nueva"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark"
        >
          <Plus className="size-5" aria-hidden="true" />
          Cargar unidad
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(({ label, valor, icono: Icono, href, tono }) => (
          <li key={label} className={cn(label === "Total" && "col-span-2 md:col-span-1")}>
            <Link
              href={href}
              className="block rounded-2xl bg-white p-4 ring-1 ring-line transition hover:ring-ink/25 sm:p-5"
            >
              <Icono className={cn("size-5", tono)} aria-hidden="true" />
              <p className="mt-3 font-display text-3xl font-bold tabular-nums">{valor}</p>
              <p className="text-sm text-ink/60">{label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl bg-white ring-1 ring-line">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">Últimas modificadas</h2>
          <Link href="/admin/unidades" className="text-sm font-semibold text-brand hover:underline">
            Ver todas
          </Link>
        </div>
        {unidades.length === 0 ? (
          <p className="px-5 py-10 text-center text-ink/60">Todavía no hay unidades cargadas.</p>
        ) : (
          <ul className="divide-y divide-line">
            {unidades.slice(0, 6).map((u) => (
              <li key={u.id}>
                <Link href={`/admin/unidades/${u.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-mist">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {u.titulo} <span className="text-ink/45">{u.anio}</span>
                    </span>
                    <span className="text-xs text-ink/50">Editada {fecha.format(new Date(u.updated_at))}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs">
                    {!u.visible && <span className="rounded-md bg-mist px-2 py-1 text-ink/60">Oculta</span>}
                    <span className="rounded-md bg-mist px-2 py-1 font-medium">{ESTADO_LABEL[u.estado]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
