"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function inputCls(error: boolean) {
  return cn(
    "w-full rounded-xl border bg-white px-3.5 py-3 text-base text-ink outline-none transition placeholder:text-ink/35 sm:text-[15px]",
    "focus:border-brand focus:ring-4 focus:ring-brand/15",
    error ? "border-red-400" : "border-line",
  );
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
  className,
  opcional,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  opcional?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium">
        {label}
        {opcional && <span className="text-xs font-normal text-ink/45">Opcional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600" data-error>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink/50">{hint}</p>
      ) : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  descripcion,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  descripcion?: string;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p id={`${id}-label`} className="font-medium">
          {label}
        </p>
        {descripcion && <p className="text-sm text-ink/55">{descripcion}</p>}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-ink/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-white shadow transition-[left]",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function Seccion({ titulo, descripcion, children, id }: { titulo: string; descripcion?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6">
      <h2 className="font-display text-lg font-semibold tracking-tight">{titulo}</h2>
      {descripcion && <p className="mt-0.5 text-sm text-ink/55">{descripcion}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ConfirmDialog({
  abierto,
  titulo,
  descripcion,
  confirmar,
  onConfirmar,
  onCerrar,
  cargando,
  children,
}: {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  confirmar: string;
  onConfirmar: () => void;
  onCerrar: () => void;
  cargando?: boolean;
  children?: ReactNode;
}) {
  const cancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const prev = document.activeElement as HTMLElement | null;
    cancelarRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !cargando && onCerrar();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [abierto, cargando, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => !cargando && onCerrar()}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        aria-describedby="confirm-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-fade-up rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:pb-6"
      >
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="confirm-titulo" className="font-display text-lg font-semibold">
              {titulo}
            </h2>
            <p id="confirm-desc" className="mt-1 text-sm text-ink/65">
              {descripcion}
            </p>
          </div>
        </div>
        {children}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelarRef}
            type="button"
            onClick={onCerrar}
            disabled={cargando}
            className="rounded-xl border border-line px-4 py-3 font-semibold transition hover:bg-mist disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {cargando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {confirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
