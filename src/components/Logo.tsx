import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo oficial (el mismo de Instagram), recortado en círculo.
 * Archivos en /public: logo-96.png, logo-192.png y logo-512.png.
 */
export function Logo({
  tono = "claro",
  tamano = 40,
  conTexto = true,
  className,
}: {
  tono?: "claro" | "oscuro";
  tamano?: number;
  conTexto?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={tamano > 96 ? "/logo-512.png" : "/logo-192.png"}
        alt={conTexto ? "" : "Camiones Exclusivos"}
        width={tamano}
        height={tamano}
        priority
        className="shrink-0 rounded-full shadow-[0_0_0_2px_rgb(255_255_255/0.12)]"
      />
      {conTexto && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display text-[15px] font-bold tracking-tight", tono === "claro" ? "text-white" : "text-ink")}>
            Camiones
          </span>
          <span
            className={cn(
              "font-display text-[15px] font-medium tracking-tight",
              tono === "claro" ? "text-white/65" : "text-ink/55",
            )}
          >
            Exclusivos
          </span>
        </span>
      )}
    </span>
  );
}
