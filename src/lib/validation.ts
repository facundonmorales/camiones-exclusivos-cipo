import { z } from "zod";
import { CATEGORIAS, CONDICIONES, ESTADOS, MONEDAS } from "./types";

const anioMax = new Date().getFullYear() + 1;

const textoOpcional = (max: number, msg: string) =>
  z
    .string()
    .trim()
    .max(max, msg)
    .nullable()
    .transform((v) => (v ? v : null));

export const especificacionSchema = z.object({
  clave: z.string().trim().min(1, "Completá el nombre del dato").max(40, "Máximo 40 caracteres"),
  valor: z.string().trim().min(1, "Completá el valor").max(120, "Máximo 120 caracteres"),
});

export const unidadSchema = z.object({
  marca: z.string().trim().min(1, "Ingresá la marca").max(60, "Máximo 60 caracteres"),
  modelo: z.string().trim().min(1, "Ingresá el modelo").max(80, "Máximo 80 caracteres"),
  titulo: z.string().trim().min(3, "El título debe tener al menos 3 caracteres").max(120, "Máximo 120 caracteres"),
  categoria: z.enum(CATEGORIAS, { error: "Elegí una categoría" }),
  condicion: z.enum(CONDICIONES, { error: "Elegí la condición" }),
  anio: z
    .number({ error: "Ingresá un año válido" })
    .int("El año tiene que ser un número entero")
    .min(1950, "El año no puede ser anterior a 1950")
    .max(anioMax, `El año no puede ser mayor a ${anioMax}`)
    .nullable(),
  km: z.number({ error: "Ingresá un número válido" }).int().min(0, "Los km no pueden ser negativos").max(9_999_999, "Revisá los km").nullable(),
  traccion: textoOpcional(20, "Máximo 20 caracteres"),
  descripcion_corta: textoOpcional(140, "Máximo 140 caracteres"),
  descripcion: textoOpcional(5000, "Máximo 5000 caracteres"),
  especificaciones: z.array(especificacionSchema).max(40, "Máximo 40 datos técnicos"),
  moneda: z.enum(MONEDAS, { error: "Elegí la moneda" }),
  precio: z.number({ error: "Ingresá un precio válido" }).min(0, "El precio no puede ser negativo").max(1e13, "Revisá el precio").nullable(),
  acepta_financiacion: z.boolean(),
  acepta_canje: z.boolean(),
  entrega_inmediata: z.boolean(),
  estado: z.enum(ESTADOS, { error: "Elegí el estado" }),
  visible: z.boolean(),
  destacada: z.boolean(),
  orden: z.number({ error: "Ingresá un número" }).int().min(0, "Mínimo 0").max(9999, "Máximo 9999"),
});
export type UnidadInput = z.input<typeof unidadSchema>;
export type UnidadDatos = z.output<typeof unidadSchema>;

export function erroresPorCampo(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
