"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Loader2, Plus, Trash2, X } from "lucide-react";
import { borrarUnidad, guardarUnidad } from "@/app/admin/actions";
import { formatNumero } from "@/lib/format";
import {
  CATEGORIAS,
  CATEGORIA_LABEL,
  CONDICIONES,
  CONDICION_LABEL,
  ESTADOS,
  ESTADO_LABEL,
  MONEDAS,
  fotosOrdenadas,
  type Categoria,
  type Condicion,
  type Especificacion,
  type Estado,
  type Moneda,
  type Unidad,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { erroresPorCampo, unidadSchema, type UnidadInput } from "@/lib/validation";
import { FotosManager, type FotoLocal } from "./FotosManager";
import { BorrarUnidadDialog } from "./UnidadesLista";
import { Field, Seccion, Toggle, inputCls } from "./ui";

const SUGERENCIAS_SPECS = ["Motor", "Potencia", "Caja", "Ejes", "Carrocería", "Cabina", "Neumáticos", "Capacidad de carga"];
const TRACCIONES = ["4x2", "4x4", "6x2", "6x4", "6x6", "8x4"];

type FormState = {
  marca: string;
  modelo: string;
  titulo: string;
  categoria: Categoria;
  condicion: Condicion;
  anio: string;
  km: string;
  traccion: string;
  descripcion_corta: string;
  descripcion: string;
  especificaciones: (Especificacion & { key: string })[];
  moneda: Moneda;
  precio: string;
  acepta_financiacion: boolean;
  acepta_canje: boolean;
  entrega_inmediata: boolean;
  estado: Estado;
  visible: boolean;
  destacada: boolean;
  orden: string;
};

const soloDigitos = (s: string) => s.replace(/\D/g, "");
const conMiles = (digitos: string) => (digitos ? formatNumero(Number(digitos)) : "");
const aNumero = (s: string) => (s.trim() === "" ? null : Number(s));

function estadoInicial(u?: Unidad): FormState {
  return {
    marca: u?.marca ?? "",
    modelo: u?.modelo ?? "",
    titulo: u?.titulo ?? "",
    categoria: u?.categoria ?? "camion",
    condicion: u?.condicion ?? "usado",
    anio: u?.anio != null ? String(u.anio) : "",
    km: u?.km != null ? String(u.km) : "",
    traccion: u?.traccion ?? "",
    descripcion_corta: u?.descripcion_corta ?? "",
    descripcion: u?.descripcion ?? "",
    especificaciones: (u?.especificaciones ?? []).map((e) => ({ ...e, key: crypto.randomUUID() })),
    moneda: u?.moneda ?? "ARS",
    precio: u?.precio != null ? String(Math.round(u.precio)) : "",
    acepta_financiacion: u?.acepta_financiacion ?? false,
    acepta_canje: u?.acepta_canje ?? false,
    entrega_inmediata: u?.entrega_inmediata ?? false,
    estado: u?.estado ?? "disponible",
    visible: u?.visible ?? true,
    destacada: u?.destacada ?? false,
    orden: String(u?.orden ?? 0),
  };
}

export function UnidadForm({ unidad }: { unidad?: Unidad }) {
  const router = useRouter();
  const nueva = !unidad;
  const [id] = useState(() => unidad?.id ?? crypto.randomUUID());
  const [f, setF] = useState<FormState>(() => estadoInicial(unidad));
  const [tituloManual, setTituloManual] = useState(!nueva);
  const [fotos, setFotos] = useState<FotoLocal[]>(() =>
    fotosOrdenadas(unidad ?? {}).map((p) => ({ key: p.id, url: p.url, path: p.storage_path, es_portada: p.es_portada })),
  );
  const [fotosQuitadas, setFotosQuitadas] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(0);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [sucio, setSucio] = useState(false);
  const [borrarAbierto, setBorrarAbierto] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Aviso al salir con cambios sin guardar
  useEffect(() => {
    if (!sucio) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [sucio]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setSucio(true);
    setF((prev) => {
      const next = { ...prev, [k]: v };
      if (!tituloManual && (k === "marca" || k === "modelo" || k === "traccion")) {
        next.titulo = [next.marca, next.modelo, next.traccion].map((s) => s.trim()).filter(Boolean).join(" ");
      }
      return next;
    });
    if (errores[k as string]) setErrores(({ [k as string]: _omit, ...rest }) => rest);
  }

  const datos = useMemo<UnidadInput>(
    () => ({
      marca: f.marca,
      modelo: f.modelo,
      titulo: f.titulo,
      categoria: f.categoria,
      condicion: f.condicion,
      anio: aNumero(f.anio),
      km: aNumero(f.km),
      traccion: f.traccion || null,
      descripcion_corta: f.descripcion_corta || null,
      descripcion: f.descripcion || null,
      especificaciones: f.especificaciones.map(({ clave, valor }) => ({ clave, valor })),
      moneda: f.moneda,
      precio: aNumero(f.precio),
      acepta_financiacion: f.acepta_financiacion,
      acepta_canje: f.acepta_canje,
      entrega_inmediata: f.entrega_inmediata,
      estado: f.estado,
      visible: f.visible,
      destacada: f.destacada,
      orden: f.orden.trim() === "" ? 0 : Number(f.orden),
    }),
    [f],
  );

  function enfocarPrimerError() {
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector("[data-error]");
      el?.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.parentElement?.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (subiendo > 0) {
      toast.warning("Esperá a que terminen de subir las fotos.");
      return;
    }
    const parsed = unidadSchema.safeParse(datos);
    if (!parsed.success) {
      setErrores(erroresPorCampo(parsed.error));
      toast.error("Revisá los campos marcados.");
      enfocarPrimerError();
      return;
    }
    setGuardando(true);
    const res = await guardarUnidad({
      id,
      nueva,
      datos,
      fotos: fotos.map((p) => ({ url: p.url, path: p.path, es_portada: p.es_portada })),
      fotosEliminadas: fotosQuitadas,
    });
    setGuardando(false);
    if (!res.ok) {
      if (res.fieldErrors) {
        setErrores(res.fieldErrors);
        enfocarPrimerError();
      }
      toast.error(res.error);
      return;
    }
    setSucio(false);
    toast.success(nueva ? "Unidad cargada" : "Cambios guardados", {
      description: f.visible ? "Ya se ve en la web." : "Está oculta: no se ve en la web.",
    });
    router.push("/admin/unidades");
    router.refresh();
  }

  async function onBorrar() {
    setBorrando(true);
    const res = await borrarUnidad(id);
    setBorrando(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setSucio(false);
    toast.success("Unidad borrada");
    router.push("/admin/unidades");
    router.refresh();
  }

  function agregarSpec(clave = "") {
    set("especificaciones", [...f.especificaciones, { key: crypto.randomUUID(), clave, valor: "" }]);
  }
  function editarSpec(i: number, campo: "clave" | "valor", valor: string) {
    set(
      "especificaciones",
      f.especificaciones.map((s, j) => (j === i ? { ...s, [campo]: valor } : s)),
    );
    const key = `especificaciones.${i}.${campo}`;
    if (errores[key]) setErrores(({ [key]: _omit, ...rest }) => rest);
  }

  const clavesUsadas = new Set(f.especificaciones.map((s) => s.clave.trim().toLowerCase()));
  const err = (k: string) => errores[k];
  const aria = (k: string) => (errores[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {});

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/unidades"
            aria-label="Volver al listado"
            className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-line transition hover:ring-ink/30"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight">{nueva ? "Cargar unidad" : "Editar unidad"}</h1>
        </div>
        {!nueva && (
          <Link
            href={`/admin/vista-previa/${id}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line transition hover:ring-ink/30"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Vista previa
          </Link>
        )}
      </div>

      <div className="space-y-5">
        <Seccion titulo="Datos básicos">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="marca" label="Marca" error={err("marca")}>
              <input id="marca" value={f.marca} onChange={(e) => set("marca", e.target.value)} placeholder="Volkswagen" className={inputCls(!!err("marca"))} {...aria("marca")} />
            </Field>
            <Field id="modelo" label="Modelo" error={err("modelo")}>
              <input id="modelo" value={f.modelo} onChange={(e) => set("modelo", e.target.value)} placeholder="31320" className={inputCls(!!err("modelo"))} {...aria("modelo")} />
            </Field>
            <Field
              id="titulo"
              label="Título en la web"
              error={err("titulo")}
              hint={tituloManual ? undefined : "Se arma solo con marca, modelo y tracción. Podés cambiarlo."}
              className="sm:col-span-2"
            >
              <input
                id="titulo"
                value={f.titulo}
                onChange={(e) => {
                  setTituloManual(true);
                  set("titulo", e.target.value);
                }}
                placeholder="Volkswagen 31320 6x4"
                className={inputCls(!!err("titulo"))}
                {...aria("titulo")}
              />
            </Field>
            <Field id="categoria" label="Categoría" error={err("categoria")}>
              <select id="categoria" value={f.categoria} onChange={(e) => set("categoria", e.target.value as Categoria)} className={inputCls(!!err("categoria"))}>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_LABEL[c]}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="condicion" label="Condición" error={err("condicion")}>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Condición">
                {CONDICIONES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={f.condicion === c}
                    id={c === "usado" ? "condicion" : undefined}
                    onClick={() => set("condicion", c)}
                    className={cn(
                      "rounded-xl border px-3 py-3 font-semibold transition",
                      f.condicion === c ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink/70",
                    )}
                  >
                    {CONDICION_LABEL[c]}
                  </button>
                ))}
              </div>
            </Field>
            <Field id="anio" label="Año" error={err("anio")} hint="Si no lo sabés, dejalo vacío y completalo después.">
              <input id="anio" inputMode="numeric" maxLength={4} value={f.anio} onChange={(e) => set("anio", soloDigitos(e.target.value).slice(0, 4))} placeholder="2011" className={inputCls(!!err("anio"))} {...aria("anio")} />
            </Field>
            <Field id="km" label="Kilómetros" error={err("km")} opcional>
              <div className="relative">
                <input id="km" inputMode="numeric" value={conMiles(f.km)} onChange={(e) => set("km", soloDigitos(e.target.value).slice(0, 7))} placeholder="350.000" className={inputCls(!!err("km")) + " pr-12"} {...aria("km")} />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-ink/45">km</span>
              </div>
            </Field>
            <Field id="traccion" label="Tracción" error={err("traccion")} opcional className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {TRACCIONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={f.traccion === t}
                    onClick={() => set("traccion", f.traccion === t ? "" : t)}
                    className={cn(
                      "rounded-lg border px-3.5 py-2 text-sm font-semibold tabular-nums transition",
                      f.traccion === t ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink/70",
                    )}
                  >
                    {t}
                  </button>
                ))}
                <input
                  id="traccion"
                  value={TRACCIONES.includes(f.traccion) ? "" : f.traccion}
                  onChange={(e) => set("traccion", e.target.value)}
                  placeholder="Otra"
                  aria-label="Otra tracción"
                  className={inputCls(!!err("traccion")) + " w-24 py-2"}
                />
              </div>
            </Field>
          </div>
        </Seccion>

        <Seccion titulo="Precio y condiciones" descripcion="Si dejás el precio vacío, en la web aparece “Consultar”.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
            <Field id="moneda" label="Moneda">
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Moneda">
                {MONEDAS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    id={m === "ARS" ? "moneda" : undefined}
                    aria-checked={f.moneda === m}
                    onClick={() => set("moneda", m)}
                    className={cn(
                      "rounded-xl border px-4 py-3 font-semibold transition",
                      f.moneda === m ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink/70",
                    )}
                  >
                    {m === "ARS" ? "$ Pesos" : "US$ Dólares"}
                  </button>
                ))}
              </div>
            </Field>
            <Field id="precio" label="Precio" error={err("precio")} opcional>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-medium text-ink/50">
                  {f.moneda === "USD" ? "US$" : "$"}
                </span>
                <input
                  id="precio"
                  inputMode="numeric"
                  value={conMiles(f.precio)}
                  onChange={(e) => set("precio", soloDigitos(e.target.value).slice(0, 13))}
                  placeholder="Consultar"
                  className={cn(inputCls(!!err("precio")), f.moneda === "USD" ? "pl-14" : "pl-8", "font-semibold tabular-nums")}
                  {...aria("precio")}
                />
              </div>
            </Field>
          </div>
          <div className="mt-4 divide-y divide-line border-t border-line">
            <Toggle id="financiacion" label="Acepta financiación" checked={f.acepta_financiacion} onChange={(v) => set("acepta_financiacion", v)} />
            <Toggle id="canje" label="Acepta canje" checked={f.acepta_canje} onChange={(v) => set("acepta_canje", v)} />
            <Toggle id="entrega" label="Entrega inmediata" checked={f.entrega_inmediata} onChange={(v) => set("entrega_inmediata", v)} />
          </div>
        </Seccion>

        <Seccion titulo="Descripción y especificaciones">
          <div className="space-y-4">
            <Field
              id="descripcion_corta"
              label="Descripción corta"
              error={err("descripcion_corta")}
              hint={`Una línea para la tarjeta del catálogo. ${f.descripcion_corta.length}/140`}
              opcional
            >
              <input
                id="descripcion_corta"
                maxLength={140}
                value={f.descripcion_corta}
                onChange={(e) => set("descripcion_corta", e.target.value)}
                placeholder="Impecable, lista para trabajar. Service al día."
                className={inputCls(!!err("descripcion_corta"))}
                {...aria("descripcion_corta")}
              />
            </Field>
            <Field id="descripcion" label="Descripción completa" error={err("descripcion")} opcional>
              <textarea
                id="descripcion"
                rows={6}
                value={f.descripcion}
                onChange={(e) => set("descripcion", e.target.value)}
                placeholder="Contá el estado de la unidad, el uso que tuvo, qué incluye…"
                className={inputCls(!!err("descripcion")) + " resize-y leading-relaxed"}
                {...aria("descripcion")}
              />
            </Field>

            <div>
              <p className="mb-1.5 text-sm font-medium">Ficha técnica</p>
              {f.especificaciones.length > 0 && (
                <ul className="space-y-2">
                  {f.especificaciones.map((s, i) => (
                    <li key={s.key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] items-start gap-2">
                      <div>
                        <input
                          value={s.clave}
                          onChange={(e) => editarSpec(i, "clave", e.target.value)}
                          placeholder="Dato (ej. Motor)"
                          aria-label={`Nombre del dato ${i + 1}`}
                          list="sugerencias-specs"
                          className={inputCls(!!err(`especificaciones.${i}.clave`))}
                        />
                        {err(`especificaciones.${i}.clave`) && (
                          <p className="mt-1 text-xs text-red-600" data-error>
                            {err(`especificaciones.${i}.clave`)}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          value={s.valor}
                          onChange={(e) => editarSpec(i, "valor", e.target.value)}
                          placeholder="Valor (ej. MWM 6 cil.)"
                          aria-label={`Valor del dato ${i + 1}`}
                          className={inputCls(!!err(`especificaciones.${i}.valor`))}
                        />
                        {err(`especificaciones.${i}.valor`) && (
                          <p className="mt-1 text-xs text-red-600" data-error>
                            {err(`especificaciones.${i}.valor`)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => set("especificaciones", f.especificaciones.filter((_, j) => j !== i))}
                        aria-label={`Quitar dato ${i + 1}`}
                        className="grid size-12 place-items-center rounded-xl text-ink/40 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="size-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <datalist id="sugerencias-specs">
                {SUGERENCIAS_SPECS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGERENCIAS_SPECS.filter((s) => !clavesUsadas.has(s.toLowerCase())).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => agregarSpec(s)}
                    className="inline-flex items-center gap-1 rounded-lg bg-mist px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:bg-brand-soft hover:text-brand"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => agregarSpec()}
                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-ink/25 px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:border-brand hover:text-brand"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Otro dato
                </button>
              </div>
            </div>
          </div>
        </Seccion>

        <Seccion titulo="Fotos" descripcion="La primera foto (portada) es la que se ve en el catálogo y al compartir por WhatsApp.">
          <FotosManager
            carpeta={`unidades/${id}`}
            fotos={fotos}
            setFotos={(v) => {
              setSucio(true);
              setFotos(v);
            }}
            onQuitar={(foto) => foto.path && setFotosQuitadas((prev) => [...prev, foto.path!])}
            onSubiendoChange={setSubiendo}
          />
        </Seccion>

        <Seccion titulo="Publicación">
          <Field id="estado" label="Estado">
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Estado">
              {ESTADOS.map((e) => (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  id={e === "disponible" ? "estado" : undefined}
                  aria-checked={f.estado === e}
                  onClick={() => set("estado", e)}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-sm font-semibold transition sm:text-base",
                    f.estado === e ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink/70",
                  )}
                >
                  {ESTADO_LABEL[e]}
                </button>
              ))}
            </div>
          </Field>
          <div className="mt-3 divide-y divide-line">
            <Toggle id="visible" label="Visible en la web" descripcion="Apagalo para ocultarla sin borrarla." checked={f.visible} onChange={(v) => set("visible", v)} />
            <Toggle id="destacada" label="Destacada" descripcion="Aparece primero en el catálogo." checked={f.destacada} onChange={(v) => set("destacada", v)} />
          </div>
          <Field id="orden" label="Orden" error={err("orden")} hint="Número más bajo = aparece antes. Las destacadas siempre van primero." className="mt-3 max-w-[200px]">
            <input id="orden" inputMode="numeric" value={f.orden} onChange={(e) => set("orden", soloDigitos(e.target.value).slice(0, 4))} className={inputCls(!!err("orden"))} {...aria("orden")} />
          </Field>
        </Seccion>

        {!nueva && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setBorrarAbierto(true)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Borrar unidad
            </button>
          </div>
        )}
      </div>

      {/* Barra de guardado: siempre a mano, también en el celular */}
      <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 -mx-4 mt-6 border-t border-line bg-mist/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-white/90 md:bottom-4">
        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-sm text-ink/55 sm:block">
            {subiendo > 0 ? `Subiendo ${subiendo} foto(s)…` : sucio ? "Hay cambios sin guardar" : nueva ? "Completá los datos y guardá" : "Sin cambios"}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Link
              href="/admin/unidades"
              className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-center font-semibold transition hover:border-ink/30 sm:flex-none"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={guardando || subiendo > 0}
              className="inline-flex flex-[2] items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 sm:flex-none"
            >
              {(guardando || subiendo > 0) && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {guardando ? "Guardando…" : subiendo > 0 ? "Subiendo fotos…" : nueva ? "Guardar unidad" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      {!nueva && unidad && (
        <BorrarUnidadDialog
          unidad={borrarAbierto ? { titulo: f.titulo || unidad.titulo, estado: f.estado, visible: f.visible } : null}
          borrando={borrando}
          onCerrar={() => setBorrarAbierto(false)}
          onConfirmar={onBorrar}
          onAlternativa={(cambios, msg) => {
            if (cambios.estado) set("estado", cambios.estado);
            if (cambios.visible !== undefined) set("visible", cambios.visible);
            setBorrarAbierto(false);
            toast.info(`${msg}. Guardá los cambios para aplicarlo.`);
          }}
        />
      )}
    </form>
  );
}
