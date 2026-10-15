import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export function FotoPlaceholder({ className, oscuro = false }: { className?: string; oscuro?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-2",
        oscuro
          ? "bg-[radial-gradient(circle_at_50%_40%,#1d1d23,#0a0a0b)] text-white/30"
          : "bg-[radial-gradient(circle_at_50%_40%,#fff,#e9edf5)] text-ink/25",
        className,
      )}
    >
      <Truck className="size-12" strokeWidth={1.25} aria-hidden="true" />
      <span className="text-xs font-medium">Foto próximamente</span>
    </div>
  );
}
