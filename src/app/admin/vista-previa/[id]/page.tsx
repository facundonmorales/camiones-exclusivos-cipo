import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Eye } from "lucide-react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { UnidadDetalle } from "@/components/public/UnidadDetalle";
import { SELECT_UNIDAD } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Unidad } from "@/lib/types";
import { UUID_RE } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vista previa" };

/** Muestra la unidad tal como se ve en la web, aunque esté oculta. Solo para administradores. */
export default async function VistaPreviaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data } = await supabase.from("unidades").select(SELECT_UNIDAD).eq("id", id).maybeSingle();
  if (!data) notFound();
  const u = data as Unidad;

  return (
    <>
      <Header />
      <div className="fixed inset-x-0 bottom-0 z-[60] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-amber-400 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-sm font-medium text-ink shadow-[0_-8px_30px_rgb(0_0_0/0.15)]">
        <span className="inline-flex items-center gap-2">
          <Eye className="size-4" aria-hidden="true" />
          Vista previa{!u.visible && " · esta unidad está oculta en la web"}
        </span>
        <Link href={`/admin/unidades/${u.id}`} className="rounded-lg bg-ink px-3 py-1.5 font-semibold text-white">
          Volver a editar
        </Link>
      </div>
      <main>
        <UnidadDetalle unidad={u} otras={[]} />
      </main>
      <Footer />
    </>
  );
}
