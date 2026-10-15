"use client";

import imageCompression from "browser-image-compression";
import { BUCKET_FOTOS } from "./config";
import { createSupabaseBrowser } from "./supabase/client";

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function esImagen(file: File) {
  return file.type.startsWith("image/") || TIPOS.includes(file.type);
}

/** Redimensiona a 1920 px como máximo y convierte a WebP (~0,7 MB). */
export async function comprimirImagen(file: File) {
  return imageCompression(file, {
    maxSizeMB: 0.7,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.82,
  });
}

/** Comprime y sube una foto a Storage. Devuelve la URL pública y la ruta. */
export async function subirFoto(file: File, carpeta: string) {
  let comprimido: File | Blob;
  try {
    comprimido = await comprimirImagen(file);
  } catch {
    throw new Error(`No se pudo procesar "${file.name}". Probá con una foto JPG o PNG.`);
  }
  const supabase = createSupabaseBrowser();
  const path = `${carpeta}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(BUCKET_FOTOS).upload(path, comprimido, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`No se pudo subir "${file.name}": ${error.message}`);
  const { data } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
