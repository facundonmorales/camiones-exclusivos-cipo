import { Beneficios } from "@/components/public/Beneficios";
import { Catalogo } from "@/components/public/Catalogo";
import { Contacto } from "@/components/public/Contacto";
import { CtaBanda } from "@/components/public/CtaBanda";
import { Hero } from "@/components/public/Hero";
import { JsonLd } from "@/components/public/JsonLd";
import { getUnidadesPublicas } from "@/lib/data";
import { autoDealerJsonLd } from "@/lib/jsonld";
import { aTarjeta } from "@/lib/types";

// Se regenera cada hora y, además, al instante cada vez que se guarda algo en el panel.
export const revalidate = 3600;

export default async function HomePage() {
  const unidades = await getUnidadesPublicas();
  return (
    <>
      <JsonLd data={autoDealerJsonLd()} />
      <Hero />
      <Beneficios />
      <Catalogo unidades={unidades.map(aTarjeta)} />
      <CtaBanda />
      <Contacto />
    </>
  );
}
