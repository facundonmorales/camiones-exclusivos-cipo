import type { Moneda } from "./types";

const miles = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function formatNumero(n: number) {
  return miles.format(n);
}

export function formatPrecio(precio: number | null, moneda: Moneda) {
  if (precio == null) return "Consultar";
  return moneda === "USD" ? `US$ ${miles.format(precio)}` : `$ ${miles.format(precio)}`;
}

export function formatKm(km: number | null) {
  if (km == null) return null;
  return `${miles.format(km)} km`;
}
