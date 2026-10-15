import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Ingresar" };

export default function LoginPage() {
  const configurado = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return (
    <main className="flex min-h-svh items-center justify-center bg-ink px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo tamano={96} conTexto={false} />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight">Panel de administración</h1>
          <p className="mt-1 text-sm text-ink/60">Ingresá con tu email y contraseña.</p>
          {configurado ? (
            <Suspense>
              <LoginForm />
            </Suspense>
          ) : (
            <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
              Falta configurar Supabase. Cargá <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (ver README).
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
