/**
 * Datos del negocio. Editá este archivo para cambiar teléfono, dirección,
 * horarios, redes, etc. Los ítems marcados con ⚠️ están pendientes de confirmar.
 */
export const SITE = {
  nombre: "Camiones Exclusivos",
  razonSocial: "Camiones Exclusivos S.R.L.",
  frase: "Camiones usados y 0 km para trabajar en serio, en el corazón del Alto Valle.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),

  // Dirección confirmada en los posteos de Instagram (Ruta 22 Km 1213, Cipolletti)
  direccion: {
    calle: "Ruta Nacional 22 Km 1213",
    localidad: "Cipolletti",
    provincia: "Río Negro",
    cp: "8324",
    pais: "AR",
  },
  // Ubicación exacta de la ficha "Camiones exclusivos" en Google Maps.
  geo: { lat: -38.9565512, lng: -67.9831711 },
  maps: {
    // Link que comparte el cliente (abre la ficha del negocio en Google Maps)
    link: "https://maps.app.goo.gl/9Yo3JtFxyKYUPibFA",
    placeId: "ChIJBzYwdxzB45URYnLbgyCBrAY",
  },
  zona: ["Cipolletti", "Neuquén", "Vaca Muerta", "Alto Valle de Río Negro y Neuquén"],

  // Teléfono de ventas que figura en casi todos los posteos de Instagram.
  // ⚠️ El brief original decía 299 523-9240: confirmar cuál usa el WhatsApp.
  telefono: "299 585-5300",
  telefonoE164: "+5492995855300",
  whatsapp: "5492995855300",
  // ⚠️ confirmar email
  email: "mundocamiones100@gmail.com",

  horarios: [
    { dias: "Lunes a viernes", horas: "9 a 18 h" },
    { dias: "Sábados", horas: "9 a 13 h" },
  ],
  // Para datos estructurados (schema.org)
  horariosSchema: [
    { dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], abre: "09:00", cierra: "18:00" },
    { dias: ["Saturday"], abre: "09:00", cierra: "13:00" },
  ],

  redes: {
    instagram: "https://www.instagram.com/camionesexclusivoscipo",
    // ⚠️ confirmar URL de la página de Facebook
    facebook: "https://www.facebook.com/camionesexclusivoscipo",
  },


  // ⚠️ confirmar con el cliente si quiere mostrar las vendidas como prueba social
  mostrarVendidos: true,
  diasVendidosVisibles: 45,
} as const;

export const BUCKET_FOTOS = "fotos";

export function direccionCompleta() {
  const d = SITE.direccion;
  return `${d.calle}, ${d.localidad}, ${d.provincia} (CP ${d.cp})`;
}

/** Mapa embebido: se centra en las coordenadas exactas (no en una búsqueda por dirección,
 *  que Google resolvía mal y marcaba otro negocio). */
export function urlMapaEmbebido() {
  const { lat, lng } = SITE.geo;
  return `https://www.google.com/maps?q=${lat},${lng}&z=16&hl=es&output=embed`;
}

/** Indicaciones hasta la ficha del negocio en Google Maps. */
export function urlComoLlegar() {
  const { lat, lng } = SITE.geo;
  return (
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` +
    `&destination_place_id=${SITE.maps.placeId}`
  );
}
