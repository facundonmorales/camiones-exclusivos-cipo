export const CATEGORIAS = ["camion", "tractor", "volcador", "chasis", "otro"] as const;
export type Categoria = (typeof CATEGORIAS)[number];
export const CATEGORIA_LABEL: Record<Categoria, string> = {
  camion: "Camión",
  tractor: "Tractor",
  volcador: "Volcador",
  chasis: "Chasis",
  otro: "Otro",
};

export const CONDICIONES = ["usado", "0km"] as const;
export type Condicion = (typeof CONDICIONES)[number];
export const CONDICION_LABEL: Record<Condicion, string> = { usado: "Usado", "0km": "0 km" };

export const ESTADOS = ["disponible", "reservado", "vendido"] as const;
export type Estado = (typeof ESTADOS)[number];
export const ESTADO_LABEL: Record<Estado, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
};

export const MONEDAS = ["ARS", "USD"] as const;
export type Moneda = (typeof MONEDAS)[number];

export type Especificacion = { clave: string; valor: string };

export type UnidadFoto = {
  id: string;
  unidad_id: string;
  url: string;
  storage_path: string | null;
  orden: number;
  es_portada: boolean;
};

export type Unidad = {
  id: string;
  slug: string;
  marca: string;
  modelo: string;
  titulo: string;
  categoria: Categoria;
  condicion: Condicion;
  anio: number | null;
  km: number | null;
  traccion: string | null;
  descripcion_corta: string | null;
  descripcion: string | null;
  especificaciones: Especificacion[];
  moneda: Moneda;
  precio: number | null;
  acepta_financiacion: boolean;
  acepta_canje: boolean;
  entrega_inmediata: boolean;
  estado: Estado;
  vendido_at: string | null;
  visible: boolean;
  destacada: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
  unidad_fotos?: UnidadFoto[];
};

/** Solo los datos que necesita la tarjeta del catálogo (la página pesa menos). */
export type UnidadTarjeta = Pick<
  Unidad,
  | "id"
  | "slug"
  | "titulo"
  | "anio"
  | "km"
  | "traccion"
  | "categoria"
  | "condicion"
  | "descripcion_corta"
  | "moneda"
  | "precio"
  | "acepta_financiacion"
  | "estado"
  | "destacada"
> & { unidad_fotos?: UnidadFoto[] };

/** Recorta una unidad a lo que usa la tarjeta, con solo la foto de portada. */
export function aTarjeta(u: Unidad): UnidadTarjeta {
  const foto = portada(u);
  return {
    id: u.id,
    slug: u.slug,
    titulo: u.titulo,
    anio: u.anio,
    km: u.km,
    traccion: u.traccion,
    categoria: u.categoria,
    condicion: u.condicion,
    descripcion_corta: u.descripcion_corta,
    moneda: u.moneda,
    precio: u.precio,
    acepta_financiacion: u.acepta_financiacion,
    estado: u.estado,
    destacada: u.destacada,
    unidad_fotos: foto ? [foto] : [],
  };
}

/** Título + año (si se conoce), para textos alternativos, metadatos y WhatsApp. */
export function nombreCompleto(u: Pick<Unidad, "titulo" | "anio">) {
  return u.anio ? `${u.titulo} ${u.anio}` : u.titulo;
}

export function fotosOrdenadas(u: Pick<Unidad, "unidad_fotos">): UnidadFoto[] {
  const fotos = [...(u.unidad_fotos ?? [])].sort((a, b) => a.orden - b.orden);
  const i = fotos.findIndex((f) => f.es_portada);
  if (i > 0) fotos.unshift(...fotos.splice(i, 1));
  return fotos;
}

export function portada(u: Pick<Unidad, "unidad_fotos">): UnidadFoto | undefined {
  return fotosOrdenadas(u)[0];
}
