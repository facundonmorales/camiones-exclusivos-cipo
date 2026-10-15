import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <p className="font-display text-7xl font-bold text-brand">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">Esta página no existe</h1>
      <p className="mt-2 max-w-sm text-white/60">Puede que el link esté mal escrito o que la página se haya movido.</p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
      >
        Ir al inicio
      </Link>
    </main>
  );
}
