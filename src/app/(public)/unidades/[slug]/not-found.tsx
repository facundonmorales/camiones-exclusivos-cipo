import Link from "next/link";

export default function UnidadNoEncontrada() {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-xl flex-col items-center justify-center px-6 pt-24 text-center">
      <h1 className="font-display text-3xl font-bold tracking-tight">Esta unidad ya no está publicada</h1>
      <p className="mt-3 text-ink/60">Puede que se haya vendido o que el link haya cambiado. Mirá las unidades disponibles.</p>
      <Link href="/#unidades" className="mt-8 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark">
        Ver unidades
      </Link>
    </div>
  );
}
