import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { cerrarSesion } from "@/app/admin/actions";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: esAdmin } = await supabase.rpc("is_admin");
  if (!esAdmin) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-mist px-5">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-line">
          <h1 className="font-display text-2xl font-bold">Sin permisos de administrador</h1>
          <p className="mt-2 text-ink/60">
            El usuario <strong>{user.email}</strong> no está habilitado para gestionar el catálogo. Pedile al
            responsable del sitio que lo agregue como administrador.
          </p>
          <form action={cerrarSesion} className="mt-6">
            <button className="rounded-xl bg-ink px-5 py-3 font-semibold text-white">Cerrar sesión</button>
          </form>
        </div>
      </main>
    );
  }

  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
