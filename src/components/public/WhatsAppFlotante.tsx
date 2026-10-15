import { WhatsAppIcon } from "@/components/icons";
import { mensajes, waLink } from "@/lib/whatsapp";

export function WhatsAppFlotante({ mensaje }: { mensaje?: string }) {
  return (
    <a
      href={waLink(mensaje ?? mensajes.general())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="group fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_-6px_rgb(37_211_102/0.6)] transition hover:scale-105 active:scale-95"
    >
      <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-25 [animation-duration:2.6s]" />
      <WhatsAppIcon className="relative size-7" />
    </a>
  );
}
