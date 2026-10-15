#!/usr/bin/env node
/**
 * Importa las fotos de los posteos de Instagram a Supabase Storage y las
 * vincula con cada unidad del seed.
 *
 *   npm run importar-fotos                       usa supabase/instagram/publicaciones.csv
 *   npm run importar-fotos -- otro.csv           usa otro CSV (por ej. uno scrapeado de nuevo)
 *   npm run importar-fotos -- --forzar           reemplaza las fotos de unidades que ya tienen
 *
 * Inicia sesión como administrador (email y contraseña del panel): no necesita
 * la clave service_role. Las URLs de Instagram vencen a los pocos días; si
 * aparecen errores 403, volvé a scrapear y pasá el CSV nuevo.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { createClient } from "@supabase/supabase-js";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const BUCKET = "fotos";
const args = process.argv.slice(2);
const forzar = args.includes("--forzar");
const csvPath = path.resolve(args.find((a) => !a.startsWith("--")) ?? path.join(RAIZ, "supabase/instagram/publicaciones.csv"));

// ── .env.local ────────────────────────────────────────────────
for (const archivo of [".env.local", ".env"]) {
  const p = path.join(RAIZ, archivo);
  if (!existsSync(p)) continue;
  for (const linea of (await readFile(p, "utf8")).split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL_SB || !KEY) {
  console.error("✖ Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

// ── CSV (RFC 4180: soporta comillas, comas y saltos de línea) ─
function parseCSV(texto) {
  const filas = [];
  let fila = [], campo = "", comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); filas.push(fila); fila = []; campo = "";
    } else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas;
  const claves = cab.map((h) => h.replace(/^\uFEFF/, "").replace(/^"|"$/g, ""));
  return resto.filter((f) => f.length > 1).map((f) => Object.fromEntries(claves.map((k, i) => [k, f[i] ?? ""])));
}

function fotosDelPosteo(p) {
  const urls = [];
  for (let i = 0; i < 20; i++) if (p[`images/${i}`]) urls.push(p[`images/${i}`]);
  if (!urls.length) {
    for (let i = 0; i < 20; i++) {
      const u = p[`childPosts/${i}/displayUrl`];
      if (u && (p[`childPosts/${i}/type`] ?? "Image") !== "Video") urls.push(u);
    }
  }
  if (!urls.length && p.displayUrl) urls.push(p.displayUrl); // video: usamos la miniatura
  return urls;
}

// ── Límites de tiempo y reintentos ────────────────────────────
// Sin esto, una conexión que se queda "colgada" (Instagram o Supabase)
// deja el script esperando para siempre.
const TIEMPO_DESCARGA = 30_000; // 30 s por foto
const TIEMPO_SUBIDA = 60_000; // 60 s por foto
const INTENTOS = 3;

class ErrorDefinitivo extends Error {} // no vale la pena reintentar (ej. 403)

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function conLimite(promesa, ms, que) {
  let t;
  const limite = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error(`${que}: sin respuesta después de ${ms / 1000} s`)), ms);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(t));
}

async function reintentar(fn) {
  let ultimo;
  for (let intento = 1; intento <= INTENTOS; intento++) {
    try {
      return await fn();
    } catch (e) {
      ultimo = e;
      if (e instanceof ErrorDefinitivo || intento === INTENTOS) break;
      process.stdout.write(`\n    ↻ ${e.message}. Reintento ${intento + 1}/${INTENTOS}…`);
      await esperar(1500 * intento);
    }
  }
  throw ultimo;
}

async function descargar(url) {
  return reintentar(async () => {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: AbortSignal.timeout(TIEMPO_DESCARGA),
    }).catch((e) => {
      throw new Error(e.name === "TimeoutError" ? `descarga: sin respuesta después de ${TIEMPO_DESCARGA / 1000} s` : `descarga: ${e.message}`);
    });
    if (res.status === 403 || res.status === 404) throw new ErrorDefinitivo(`${res.status} (la URL de Instagram venció)`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tipo = res.headers.get("content-type") ?? "";
    if (!tipo.startsWith("image/")) throw new ErrorDefinitivo(`no es una imagen (${tipo})`);
    const datos = Buffer.from(await conLimite(res.arrayBuffer(), TIEMPO_DESCARGA, "descarga"));
    return { datos, tipo: tipo.includes("webp") ? "image/webp" : tipo.includes("png") ? "image/png" : "image/jpeg" };
  });
}

async function subir(ruta, datos, tipo) {
  return reintentar(async () => {
    const { error } = await conLimite(
      supabase.storage.from(BUCKET).upload(ruta, datos, { contentType: tipo, upsert: true, cacheControl: "31536000" }),
      TIEMPO_SUBIDA,
      "subida",
    );
    if (error) throw new Error(`subida: ${error.message}`);
  });
}

// ── Main ──────────────────────────────────────────────────────
if (!existsSync(csvPath)) {
  console.error(`✖ No encuentro el CSV: ${csvPath}`);
  process.exit(1);
}
const posteos = new Map(parseCSV(await readFile(csvPath, "utf8")).map((p) => [p.shortCode, p]));
const mapa = JSON.parse(await readFile(path.join(RAIZ, "supabase/instagram/fotos.json"), "utf8"));

let email = process.env.ADMIN_EMAIL;
let password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log("Iniciá sesión con tu usuario administrador del panel.");
  email ||= (await rl.question("Email: ")).trim();
  password ||= await rl.question("Contraseña (se ve al escribir): ");
  rl.close();
}

const supabase = createClient(URL_SB, KEY, { auth: { persistSession: false } });
const { error: errLogin } = await supabase.auth.signInWithPassword({ email, password });
if (errLogin) {
  console.error("✖ No se pudo iniciar sesión:", errLogin.message);
  process.exit(1);
}
const { data: esAdmin } = await supabase.rpc("is_admin");
if (!esAdmin) {
  console.error("✖ Ese usuario no figura en la tabla admins (ver README, paso 4).");
  process.exit(1);
}

const resumen = { ok: 0, saltadas: 0, sinUnidad: 0, fotos: 0, errores: 0 };

for (const { slug, publicaciones } of mapa) {
  const { data: u } = await supabase.from("unidades").select("id, titulo, unidad_fotos(id, storage_path)").eq("slug", slug).maybeSingle();
  if (!u) {
    console.warn(`• ${slug}: no existe en la base (¿corriste el seed?)`);
    resumen.sinUnidad++;
    continue;
  }
  if (u.unidad_fotos.length && !forzar) {
    console.log(`• ${u.titulo}: ya tiene ${u.unidad_fotos.length} fotos, se deja como está (usá --forzar para reemplazar)`);
    resumen.saltadas++;
    continue;
  }

  const urls = [...new Set(publicaciones.flatMap((sc) => (posteos.has(sc) ? fotosDelPosteo(posteos.get(sc)) : [])))];
  const faltantes = publicaciones.filter((sc) => !posteos.has(sc));
  if (faltantes.length) console.warn(`  ${u.titulo}: el CSV no tiene los posteos ${faltantes.join(", ")}`);
  if (!urls.length) {
    console.warn(`• ${u.titulo}: no hay fotos en el CSV`);
    continue;
  }

  const subidas = [];
  process.stdout.write(`… ${u.titulo}: `);
  for (const [i, url] of urls.entries()) {
    process.stdout.write(`${i + 1}/${urls.length} `);
    try {
      const { datos, tipo } = await descargar(url);
      const ext = tipo === "image/webp" ? "webp" : tipo === "image/png" ? "png" : "jpg";
      const ruta = `unidades/${u.id}/instagram-${String(i + 1).padStart(2, "0")}.${ext}`;
      await subir(ruta, datos, tipo);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
      subidas.push({ url: `${data.publicUrl}?v=${Date.now()}`, ruta });
    } catch (e) {
      resumen.errores++;
      process.stdout.write(`\n  ✖ foto ${i + 1} de ${u.titulo}: ${e.message}\n  `);
    }
  }
  process.stdout.write("\n");
  if (!subidas.length) continue;

  if (u.unidad_fotos.length) {
    await supabase.from("unidad_fotos").delete().eq("unidad_id", u.id);
    const viejas = u.unidad_fotos.map((f) => f.storage_path).filter((p) => p && !subidas.some((s) => s.ruta === p));
    if (viejas.length) await supabase.storage.from(BUCKET).remove(viejas);
  }
  const { error } = await supabase.from("unidad_fotos").insert(
    subidas.map((s, i) => ({ unidad_id: u.id, url: s.url, storage_path: s.ruta, orden: i, es_portada: i === 0 })),
  );
  if (error) {
    resumen.errores++;
    console.warn(`  ✖ ${u.titulo}: no se pudieron guardar las fotos (${error.message})`);
    continue;
  }
  resumen.ok++;
  resumen.fotos += subidas.length;
  console.log(`✔ ${u.titulo}: ${subidas.length} fotos`);
}

await supabase.auth.signOut();
console.log(
  `\nListo: ${resumen.ok} unidades con fotos nuevas (${resumen.fotos} fotos), ${resumen.saltadas} ya tenían fotos, ` +
    `${resumen.sinUnidad} sin unidad en la base, ${resumen.errores} errores.`,
);
if (resumen.errores) console.log("Si fueron errores 403, volvé a scrapear Instagram y corré: npm run importar-fotos -- ruta/al/nuevo.csv");
console.log("Para ver los cambios en la web al instante, guardá cualquier unidad desde el panel (o esperá hasta 1 hora).");
process.exit(resumen.errores ? 1 : 0);
