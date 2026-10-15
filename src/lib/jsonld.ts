import { SITE } from "./config";
import { fotosOrdenadas, nombreCompleto, type Unidad } from "./types";

export function autoDealerJsonLd() {
  const d = SITE.direccion;
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: SITE.nombre,
    legalName: SITE.razonSocial,
    url: SITE.url,
    telephone: SITE.telefonoE164,
    email: SITE.email,
    description:
      "Compra y venta de camiones usados y 0 km en Cipolletti, Río Negro. Financiación y permutas.",
    address: {
      "@type": "PostalAddress",
      streetAddress: d.calle,
      addressLocality: d.localidad,
      addressRegion: d.provincia,
      postalCode: d.cp,
      addressCountry: d.pais,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    areaServed: SITE.zona.map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: SITE.horariosSchema.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dias,
      opens: h.abre,
      closes: h.cierra,
    })),
    sameAs: [SITE.redes.instagram, SITE.redes.facebook],
  };
}

const DISPONIBILIDAD = {
  disponible: "https://schema.org/InStock",
  reservado: "https://schema.org/LimitedAvailability",
  vendido: "https://schema.org/SoldOut",
} as const;

export function vehicleJsonLd(u: Unidad) {
  const url = `${SITE.url}/unidades/${u.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: nombreCompleto(u),
    url,
    brand: { "@type": "Brand", name: u.marca },
    model: u.modelo,
    ...(u.anio && { vehicleModelDate: String(u.anio) }),
    itemCondition: u.condicion === "0km" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    ...(u.km != null && {
      mileageFromOdometer: { "@type": "QuantitativeValue", value: u.km, unitCode: "KMT" },
    }),
    ...(u.traccion && { driveWheelConfiguration: u.traccion }),
    image: fotosOrdenadas(u).map((f) => f.url),
    description: u.descripcion_corta ?? u.descripcion ?? undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: u.moneda,
      ...(u.precio != null && { price: u.precio }),
      availability: DISPONIBILIDAD[u.estado],
      seller: { "@type": "AutoDealer", name: SITE.nombre, url: SITE.url },
    },
  };
}
