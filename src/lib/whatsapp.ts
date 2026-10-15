import { SITE } from "./config";

export function waLink(mensaje: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/** Mensajes prearmados según el contexto */
export const mensajes = {
  general: () => "¡Hola Camiones Exclusivos! Quería hacerles una consulta.",
  unidad: (titulo: string, url: string) =>
    `¡Hola! Me interesa la unidad *${titulo}*. ¿Sigue disponible?\n${url}`,
  visita: () => "¡Hola! Quería coordinar una visita para ver unidades. ¿Qué día les queda bien?",
  busqueda: () => "¡Hola! Estoy buscando un camión que no encontré en la web. Necesito: ",
};
