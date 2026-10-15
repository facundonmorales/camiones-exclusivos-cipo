import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/public/JsonLd";
import { UnidadDetalle } from "@/components/public/UnidadDetalle";
import { getOtrasUnidades, getUnidadPorSlug } from "@/lib/data";
import { formatPrecio } from "@/lib/format";
import { vehicleJsonLd } from "@/lib/jsonld";
import { CONDICION_LABEL, nombreCompleto, portada } from "@/lib/types";

export const revalidate = 3600;

// Cada unidad se genera la primera vez que alguien la visita y queda en caché (ISR).
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const u = await getUnidadPorSlug(slug);
  if (!u) return { title: "Unidad no encontrada", robots: { index: false } };

  const precio = u.estado === "vendido" ? "Vendido" : formatPrecio(u.precio, u.moneda);
  const foto = portada(u);
  const titulo = `${nombreCompleto(u)} — ${precio}`;
  const descripcion =
    u.descripcion_corta ??
    `${nombreCompleto(u)}, ${CONDICION_LABEL[u.condicion].toLowerCase()}. ${precio}. En Camiones Exclusivos, Cipolletti, Río Negro.`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/unidades/${u.slug}` },
    openGraph: {
      type: "website",
      title: titulo,
      description: descripcion,
      url: `/unidades/${u.slug}`,
      ...(foto && { images: [{ url: foto.url, alt: nombreCompleto(u) }] }),
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion },
  };
}

export default async function UnidadPage({ params }: Props) {
  const { slug } = await params;
  const u = await getUnidadPorSlug(slug);
  if (!u) notFound();
  const otras = await getOtrasUnidades(u.id);

  return (
    <>
      <JsonLd data={vehicleJsonLd(u)} />
      <UnidadDetalle unidad={u} otras={otras} />
    </>
  );
}
