"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Camera, GripVertical, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { esImagen, subirFoto } from "@/lib/upload";
import { cn } from "@/lib/utils";

export type FotoLocal = { key: string; url: string; path: string | null; es_portada: boolean };

type Subiendo = { key: string; nombre: string; preview: string };

const MAX_FOTOS = 40;
const SUBIDAS_EN_PARALELO = 3;

function asegurarPortada(fotos: FotoLocal[]) {
  if (fotos.length === 0 || fotos.some((f) => f.es_portada)) return fotos;
  return fotos.map((f, i) => ({ ...f, es_portada: i === 0 }));
}

function FotoTile({
  foto,
  indice,
  onPortada,
  onBorrar,
}: {
  foto: FotoLocal;
  indice: number;
  onPortada: () => void;
  onBorrar: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: foto.key });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative aspect-[4/3] touch-manipulation overflow-hidden rounded-xl bg-mist ring-1 ring-line",
        isDragging && "z-10 scale-[1.03] shadow-2xl ring-2 ring-brand",
        foto.es_portada && "ring-2 ring-brand",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        aria-label={`Foto ${indice + 1}. Mantené presionado o usá espacio y flechas para moverla.`}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto.url} alt="" draggable={false} className="h-full w-full select-none object-cover" />
      </div>
      <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-md bg-ink/75 px-1.5 py-1 text-xs font-semibold text-white">
        <GripVertical className="size-3.5" aria-hidden="true" />
        {indice + 1}
      </span>
      {foto.es_portada && (
        <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-brand px-2 py-1 text-xs font-semibold text-white">
          Portada
        </span>
      )}
      <div className="absolute right-1.5 top-1.5 flex gap-1">
        {!foto.es_portada && (
          <button
            type="button"
            onClick={onPortada}
            aria-label={`Usar foto ${indice + 1} como portada`}
            title="Usar como portada"
            className="grid size-9 place-items-center rounded-lg bg-white/95 text-ink shadow transition hover:text-brand"
          >
            <Star className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onBorrar}
          aria-label={`Quitar foto ${indice + 1}`}
          title="Quitar foto"
          className="grid size-9 place-items-center rounded-lg bg-white/95 text-red-600 shadow transition hover:bg-red-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

export function FotosManager({
  carpeta,
  fotos,
  setFotos,
  onQuitar,
  onSubiendoChange,
}: {
  carpeta: string;
  fotos: FotoLocal[];
  setFotos: Dispatch<SetStateAction<FotoLocal[]>>;
  onQuitar: (foto: FotoLocal) => void;
  onSubiendoChange?: (cantidad: number) => void;
}) {
  const [subiendo, setSubiendo] = useState<Subiendo[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const galeriaRef = useRef<HTMLInputElement>(null);
  const camaraRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function actualizarSubiendo(fn: (prev: Subiendo[]) => Subiendo[]) {
    setSubiendo((prev) => {
      const next = fn(prev);
      onSubiendoChange?.(next.length);
      return next;
    });
  }

  async function procesar(lista: FileList | File[]) {
    const archivos = Array.from(lista).filter(esImagen);
    const descartados = Array.from(lista).length - archivos.length;
    if (descartados > 0) toast.warning(`${descartados} archivo(s) no son imágenes y se omitieron.`);
    const lugar = MAX_FOTOS - fotos.length - subiendo.length;
    if (lugar <= 0) {
      toast.error(`Llegaste al máximo de ${MAX_FOTOS} fotos.`);
      return;
    }
    if (archivos.length > lugar) toast.warning(`Solo se agregan ${lugar} fotos más (máximo ${MAX_FOTOS}).`);
    const cola = archivos.slice(0, lugar).map((file) => ({ file, key: crypto.randomUUID(), preview: URL.createObjectURL(file) }));
    actualizarSubiendo((prev) => [...prev, ...cola.map((c) => ({ key: c.key, nombre: c.file.name, preview: c.preview }))]);

    let ok = 0;
    const trabajar = async () => {
      while (cola.length) {
        const item = cola.shift()!;
        try {
          const { url, path } = await subirFoto(item.file, carpeta);
          setFotos((prev) => asegurarPortada([...prev, { key: item.key, url, path, es_portada: false }]));
          ok++;
        } catch (e) {
          toast.error(e instanceof Error ? e.message : `No se pudo subir ${item.file.name}`);
        } finally {
          URL.revokeObjectURL(item.preview);
          actualizarSubiendo((prev) => prev.filter((s) => s.key !== item.key));
        }
      }
    };
    await Promise.all(Array.from({ length: SUBIDAS_EN_PARALELO }, trabajar));
    if (ok > 0) toast.success(ok === 1 ? "Foto subida" : `${ok} fotos subidas`, { description: "Recordá guardar la unidad." });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setFotos((prev) => {
      const desde = prev.findIndex((f) => f.key === active.id);
      const hasta = prev.findIndex((f) => f.key === over.id);
      return arrayMove(prev, desde, hasta);
    });
  }

  function quitar(foto: FotoLocal) {
    setFotos((prev) => asegurarPortada(prev.filter((f) => f.key !== foto.key)));
    onQuitar(foto);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setArrastrando(true);
          }
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setArrastrando(false);
          procesar(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
          arrastrando ? "border-brand bg-brand-soft" : "border-line bg-mist/60",
        )}
      >
        <ImagePlus className="size-8 text-brand" aria-hidden="true" />
        <p className="mt-2 font-semibold">Agregá fotos de la unidad</p>
        <p className="mt-1 text-sm text-ink/55">
          <span className="hidden md:inline">Arrastralas acá o elegilas. </span>Se achican automáticamente antes de subir.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => galeriaRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-3"
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            Elegir fotos
          </button>
          <button
            type="button"
            onClick={() => camaraRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line transition hover:ring-ink/30 md:hidden"
          >
            <Camera className="size-4" aria-hidden="true" />
            Sacar foto
          </button>
        </div>
        <input
          ref={galeriaRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) procesar(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={camaraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            if (e.target.files) procesar(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(fotos.length > 0 || subiendo.length > 0) && (
        <>
          <p className="mt-4 text-sm text-ink/55">
            {fotos.length} {fotos.length === 1 ? "foto" : "fotos"}. Arrastrá para ordenar (en el celular, mantené presionada
            la foto). Tocá la estrella para elegir la portada.
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={fotos.map((f) => f.key)} strategy={rectSortingStrategy}>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {fotos.map((f, i) => (
                  <FotoTile
                    key={f.key}
                    foto={f}
                    indice={i}
                    onPortada={() => setFotos((prev) => prev.map((p) => ({ ...p, es_portada: p.key === f.key })))}
                    onBorrar={() => quitar(f)}
                  />
                ))}
                {subiendo.map((s) => (
                  <li key={s.key} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-mist ring-1 ring-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.preview} alt="" className="h-full w-full object-cover opacity-40" />
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs font-medium text-ink/70">
                      <Loader2 className="size-5 animate-spin text-brand" aria-hidden="true" />
                      Subiendo…
                    </span>
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
