import { Reveal } from "./Reveal";

const ITEMS = [
  { n: "01", titulo: "Usados y 0 km", texto: "Unidades seleccionadas para cada tipo de trabajo." },
  // Condiciones tomadas de los posteos de Instagram
  {
    n: "02",
    titulo: "Financiación",
    texto: "Entregás el 50% y financiamos el resto en hasta 18 cuotas. Aceptamos cheques, documentos y tu usado.",
  },
  { n: "03", titulo: "Entrega inmediata", texto: "Unidades listas para salir a la ruta." },
  { n: "04", titulo: "Recibimos tu usado", texto: "Tomamos tu camión o vehículo en parte de pago al mejor precio." },
];

export function Beneficios() {
  return (
    <section aria-labelledby="beneficios-titulo" className="bg-mist py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2
          id="beneficios-titulo"
          className="max-w-2xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl"
        >
          Todo lo que necesitás para comprar tu próximo camión, en un solo lugar
        </h2>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((b, i) => (
            <li key={b.n}>
              <Reveal delay={i * 90} className="h-full">
                <div className="group flex h-full flex-col rounded-2xl bg-white p-7 shadow-card ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <span className="font-display text-sm font-bold text-brand">{b.n}</span>
                  <span aria-hidden="true" className="mt-4 h-px w-10 bg-ink/15 transition-all duration-300 group-hover:w-16 group-hover:bg-brand" />
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{b.titulo}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{b.texto}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
