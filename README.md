# Camiones Exclusivos — sitio web y panel de administración

Sitio de **Camiones Exclusivos S.R.L.** (Cipolletti, Río Negro): web pública orientada a ventas y panel privado (`/admin`) para que el dueño gestione el catálogo desde el celular, sin tocar código.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage) · Vercel.

---

## Contenido

1. [Requisitos](#1-requisitos)
2. [Crear el proyecto en Supabase](#2-crear-el-proyecto-en-supabase)
3. [Correr la migración y el seed](#3-correr-la-migración-y-el-seed)
4. [Crear el primer administrador](#4-crear-el-primer-administrador)
5. [Correr el sitio en tu computadora](#5-correr-el-sitio-en-tu-computadora)
6. [Deploy en Vercel](#6-deploy-en-vercel)
7. [Cómo se usa el panel](#7-cómo-se-usa-el-panel)
8. [Personalizar datos, logo y hero](#8-personalizar-datos-logo-y-hero)
9. [Estructura del proyecto](#9-estructura-del-proyecto)
10. [Pendientes a confirmar con el cliente](#10-pendientes-a-confirmar-con-el-cliente)

---

## 1. Requisitos

- Node.js 20 o superior.
- Una cuenta gratuita en [supabase.com](https://supabase.com) y otra en [vercel.com](https://vercel.com).
- (Opcional) Un repositorio en GitHub para conectar con Vercel.

```bash
npm install
cp .env.example .env.local
```

## 2. Crear el proyecto en Supabase

1. En Supabase, **New project**. Región sugerida: *South America (São Paulo)*, la más cercana.
2. Guardá la contraseña de la base de datos en un lugar seguro.
3. Cuando termine de crearse, andá a **Project Settings → API** (o **API Keys**) y copiá:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (o la *publishable key* `sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Pegalos en `.env.local`.

> ⚠️ Nunca uses la clave `service_role` / *secret* en este proyecto. No hace falta: la seguridad la dan las políticas de Row Level Security.

## 3. Correr la migración y el seed

### Opción A — desde el navegador (más simple)

1. En Supabase, abrí **SQL Editor → New query**.
2. Pegá todo el contenido de `supabase/migrations/20260101000000_esquema_inicial.sql` y tocá **Run**. Esto crea:
   - las tablas `unidades`, `unidad_fotos` y `admins`;
   - los triggers (`updated_at`, fecha de venta);
   - las políticas de Row Level Security;
   - el bucket público `fotos` en Storage con escritura solo para administradores.
3. Si es una base que ya tenías creada, corré también `supabase/migrations/20261015000000_anio_opcional.sql` (permite unidades sin año) y `supabase/migrations/20261015000001_quitar_hidrogruas.sql` (quita la tabla y la categoría de hidrogrúas).
4. En una consulta nueva, pegá `supabase/seed.sql` y tocá **Run**. Carga las **24 unidades reales** tomadas de Instagram (sin fotos todavía). Si antes corriste el seed viejo, borra solo las unidades `[EJEMPLO]`; se puede correr varias veces sin duplicar nada.
5. Después de crear tu usuario administrador (paso 4), cargá las fotos con `npm run importar-fotos` (ver más abajo).

### Opción B — con la CLI de Supabase

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push                      # aplica supabase/migrations
npx supabase db execute -f supabase/seed.sql   # o pegalo en el SQL Editor
```

## 4. Crear el primer administrador

No hay registro público. Los administradores se crean desde Supabase:

1. **Authentication → Users → Add user → Create new user**. Cargá email y contraseña y marcá **Auto Confirm User**.
2. En **SQL Editor**, habilitalo como administrador (reemplazá el email):

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'dueño@ejemplo.com';
   ```

3. Recomendado: **Authentication → Sign In / Providers → Email** y desactivá **Allow new users to sign up**, así nadie puede crearse una cuenta por su cuenta.

Para dar de baja a alguien: `delete from public.admins where user_id = '…';` (o borrá el usuario en Authentication).

### Importar fotos de Instagram

Las unidades del seed salen de los posteos de @camionesexclusivoscipo (scrapeados el 15/10/2026). Las fotos se descargan de Instagram y se suben al Storage de Supabase con:

```bash
npm run importar-fotos
```

El script pide el email y la contraseña del administrador (o los toma de `ADMIN_EMAIL` / `ADMIN_PASSWORD`), lee `supabase/instagram/publicaciones.csv`, descarga las fotos de cada posteo y las vincula con su unidad según `supabase/instagram/fotos.json`. La primera foto queda como portada; después se pueden reordenar desde el panel.

> ⚠️ **Las URLs de las fotos de Instagram vencen.** Las del CSV actual dejan de funcionar alrededor del **19/10/2026**. Si el script muestra errores 403, volvé a scrapear el perfil con la misma herramienta y pasale el CSV nuevo: `npm run importar-fotos -- ruta/al/nuevo.csv`. Las unidades que ya tienen fotos se saltean; con `--forzar` se reemplazan.

`publicaciones.csv` es una versión reducida del scrapeo: solo tiene los posteos usados, sin comentarios ni datos de otras cuentas.

## 5. Correr el sitio en tu computadora

```bash
npm run dev
```

- Web pública: <http://localhost:3000>
- Panel: <http://localhost:3000/admin>

Otros comandos: `npm run build`, `npm start`, `npm run typecheck`.

## 6. Deploy en Vercel

1. Subí el proyecto a GitHub.
2. En Vercel: **Add New → Project**, importá el repositorio (Vercel detecta Next.js solo).
3. En **Environment Variables** cargá las tres de `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → la URL final, por ejemplo `https://camionesexclusivos.com.ar` (sin barra al final)
4. **Deploy**.
5. Si conectás un dominio propio, actualizá `NEXT_PUBLIC_SITE_URL` y volvé a deployar.
6. En Supabase → **Authentication → URL Configuration**, poné la misma URL en **Site URL**.
7. Probá el link de una unidad en el [Sharing Debugger de Facebook](https://developers.facebook.com/tools/debug/) para ver la vista previa que va a mostrar WhatsApp.
8. Cargá `https://TU-DOMINIO/sitemap.xml` en Google Search Console y creá/actualizá el perfil de Google Business con la misma dirección y teléfono.

## 7. Cómo se usa el panel

- **Resumen:** totales de unidades disponibles, reservadas, vendidas y ocultas.
- **Unidades:** buscador y filtros. Desde el listado, sin entrar a editar, se puede cambiar el estado, mostrar/ocultar (ojo) y destacar (estrella).
- **Cargar / editar unidad:** formulario en bloques. El título se arma solo con marca, modelo y tracción; el *slug* (link) se genera solo con marca + modelo + año y **no cambia al editar**, para no romper links ya compartidos.
- **Fotos:** se pueden elegir varias a la vez, arrastrar desde la compu o sacar con la cámara del celular. Se achican a 1920 px y se convierten a WebP antes de subir. Para ordenarlas se arrastran (en el celular, mantener presionada la foto). La estrella elige la portada.
  Las fotos se suben al elegirlas, pero los cambios (orden, portada, fotos quitadas) se aplican al tocar **Guardar**.
- **Vista previa:** muestra la unidad tal como se ve en la web, aunque esté oculta.
- **Borrar:** pide confirmación y borra también las fotos del Storage. El cuadro sugiere marcarla como vendida u ocultarla en su lugar.
- Todo cambio se refleja en la web al instante (revalidación de páginas); además las páginas se regeneran solas cada hora.

**Orden del catálogo:** primero las destacadas, después por el campo *Orden* (número más bajo primero) y por último las más nuevas. Las vendidas van al final, con la foto atenuada, durante los días configurados en `SITE.diasVendidosVisibles`.

## 8. Personalizar datos, logo y hero

Todos los datos del negocio están en **`src/lib/config.ts`**: dirección, coordenadas, teléfono, WhatsApp, email, horarios, redes, días que se muestran las vendidas y si se muestran.

- **Logo:** se usa el de Instagram, recortado en círculo (`public/logo-96.png`, `logo-192.png`, `logo-512.png`; también el favicon en `src/app/icon.png`). Para cambiarlo, reemplazá esos archivos manteniendo los nombres.
- **Video del banner:** está en `public/video/` en cuatro versiones livianas (960 y 1280 px, WebM y MP4, sin audio) más el póster `public/hero-poster.webp`, que se ve mientras carga. El componente es `src/components/public/HeroVideo.tsx`. Para reemplazarlo por otro video (`nuevo.mov`), con [ffmpeg](https://ffmpeg.org):

  ```bash
  ffmpeg -i nuevo.mov -an -vf scale=1280:-2 -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart public/video/hero-1280.mp4
  ffmpeg -i nuevo.mov -an -vf scale=960:-2  -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart public/video/hero-960.mp4
  ffmpeg -i nuevo.mov -an -vf scale=1280:-2 -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 public/video/hero-1280.webm
  ffmpeg -i nuevo.mov -an -vf scale=960:-2  -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 public/video/hero-960.webm
  ffmpeg -i nuevo.mov -frames:v 1 -vf scale=1600:-2 public/hero-poster.webp
  ```
- **Mensajes de WhatsApp prearmados:** `src/lib/whatsapp.ts`.
- **Colores y tipografías:** `src/app/globals.css` (bloque `@theme`) y `src/app/layout.tsx`.

## 9. Estructura del proyecto

```
supabase/
  migrations/…_esquema_inicial.sql   Tablas, RLS y Storage
  seed.sql                           Datos iniciales
src/
  middleware.ts                      Protege /admin (redirige al login)
  app/
    (public)/                        Web pública
      page.tsx                       Inicio: hero, beneficios, catálogo, contacto
      unidades/[slug]/page.tsx       Detalle de unidad (SEO + Open Graph + JSON-LD)
    admin/
      login/                         Ingreso
      (panel)/                       Resumen y unidades (protegidos)
      vista-previa/[id]/             Vista previa de una unidad
      actions.ts                     Server actions (guardar, borrar, cambios rápidos)
    sitemap.ts · robots.ts · opengraph-image.tsx
  components/
    public/                          Componentes de la web
    admin/                           Formularios, listado, gestor de fotos
  lib/
    config.ts                        Datos del negocio
    data.ts                          Consultas públicas
    validation.ts                    Validaciones (mensajes en español)
    supabase/                        Clientes de Supabase
```

**Seguridad:** el navegador solo usa la clave pública. Las políticas RLS permiten al público leer únicamente lo visible, y solo los usuarios que figuran en `admins` pueden crear, editar o borrar (en la base y en Storage). Las server actions vuelven a verificar el permiso antes de cada cambio.

## 10. Pendientes a confirmar con el cliente

- [ ] Coordenadas exactas del predio para el mapa (la dirección Ruta 22 Km 1213 figura en Instagram).
- [ ] Teléfono / WhatsApp: el sitio usa 299 585-5300 (el de Instagram); el brief decía 299 523-9240.
- [ ] Email mundocamiones100@gmail.com.
- [ ] URL de la página de Facebook.
- [ ] Condiciones de financiación: se tomaron de Instagram (50% de entrega, hasta 18 cuotas). Confirmar que sigan vigentes.
- [ ] Si quiere mostrar las unidades vendidas como prueba social, y por cuántos días (`mostrarVendidos`, `diasVendidosVisibles`).
- [ ] Volkswagen 31320 6x4: el brief dice 2011 y $110.000.000; el posteo de Instagram dice 2010.
- [ ] Ford Cargo 1722 regador: se unificaron dos posteos que parecen la misma unidad.
- [ ] Año de Iveco Cursor 330, Actros 2041, Atron 1634 y Scania G380 (los posteos no lo dicen).
- [ ] Precios de las unidades que figuran como "Consultar".
- [ ] Unidades que ya se vendieron después del 15/10/2026: marcarlas desde el panel.
