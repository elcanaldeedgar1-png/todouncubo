# TODO UN CUBO

Biblioteca y comunidad de Minecraft de **TrexxCraft**: semillas con coordenadas, videos de YouTube que se importan solos, mods, shaders, tutoriales, novedades y un panel de administración privado.

**Tecnología:** Next.js 15 (App Router) · Supabase (PostgreSQL, Auth, Storage) · YouTube Data API v3 / RSS / WebSub · Tailwind CSS · Vercel.

---

## 1. Puesta en marcha (una sola vez)

### 1.1 Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre **SQL Editor**, pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**. Crea las tablas, la seguridad (RLS), el bucket de imágenes `media` y las 5 categorías iniciales.
3. En **Authentication → Users → Add user** crea tu usuario (correo + contraseña). Desactiva el registro público en **Authentication → Providers → Email → “Allow new users to sign up”**.
4. Conviértete en administrador ejecutando en el SQL Editor (con tu correo):
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'TU_CORREO';
   ```

### 1.2 Variables de entorno
Copia `.env.example` a `.env.local` y rellénalo:

| Variable | Dónde se obtiene |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Tu dominio final, p. ej. `https://www.todouncubo.com` |
| `NEXT_PUBLIC_YOUTUBE_URL` | El enlace de tu canal (lo usan todos los botones de YouTube) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Igual. **Secreta**: solo se usa en el servidor |
| `YOUTUBE_CHANNEL_ID` | Tu ID de canal (`UC…`): YouTube Studio → Configuración → Canal → Configuración avanzada |
| `YOUTUBE_API_KEY` | Opcional. Google Cloud Console → habilita *YouTube Data API v3* → Credenciales → Clave de API |
| `CRON_SECRET`, `WEBSUB_SECRET` | Inventa dos cadenas largas y aleatorias |
| `NEXT_PUBLIC_ADSENSE_*` | Opcional, cuando AdSense apruebe el sitio |

> Sin Supabase configurado la web arranca en **modo demo** con contenido de ejemplo para que puedas ver el diseño.

### 1.3 Ejecutar en local
```bash
npm install
npm run dev
```
Abre http://localhost:3000 y el panel en http://localhost:3000/admin.

### 1.4 Publicar en Cloudflare Workers
El proyecto usa el adaptador oficial **OpenNext** (`@opennextjs/cloudflare`). Configuración: [`wrangler.jsonc`](wrangler.jsonc), [`open-next.config.ts`](open-next.config.ts) y [`custom-worker.ts`](custom-worker.ts) (añade las tareas programadas).

1. Sube el proyecto a un repositorio de GitHub (el `.gitignore` ya excluye `.env.local` y `.dev.vars`).
2. Cloudflare → **Workers & Pages → Create → Import a repository** → elige el repositorio.
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy`
3. En **Settings → Variables and secrets** añade (tipo *Secret* para las claves):
   `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_YOUTUBE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `YOUTUBE_CHANNEL_ID`, `YOUTUBE_API_KEY`, `CRON_SECRET`, `WEBSUB_SECRET`.
   Las `NEXT_PUBLIC_*` también deben estar en **Settings → Build → Variables** porque se incluyen al compilar.
4. Conecta tu dominio en **Settings → Domains & Routes**.
5. Entra al panel → **Ajustes** → **Activar notificaciones** y después **Videos → Sincronizar ahora**.

Probar localmente con el motor de Cloudflare: copia `.env.local` a `.dev.vars` y ejecuta `npm run preview`.
Publicar a mano desde tu ordenador (alternativa a GitHub): `npx wrangler login` y luego `npm run deploy`.

---

## 2. Cómo se actualiza sola la web

| Qué pasa | Cómo funciona |
|---|---|
| Subes un video a YouTube | YouTube avisa a `/api/youtube/websub` al instante (WebSub). El video se guarda y la portada se regenera. |
| Respaldo por si falla el aviso | `/api/youtube/sync` consulta el canal periódicamente (frecuencia configurable en el panel). Usa la API v3 si hay clave y, si falla, el RSS público. |
| Añades una semilla o un artículo | Al guardar se regeneran todas las páginas afectadas: aparece al instante en la biblioteca, la portada, la categoría y el sitemap. |
| Duplicados | `youtube_id` es único, una semilla no puede repetir código + versión, y los slugs son únicos. |
| Fechas | Todas las tablas guardan `created_at` y `updated_at` (automático por trigger) y `published_at`. |

**La sincronización nunca crea semillas.** Las fichas de semillas se crean en el panel y se relacionan con su video desde ahí (en *Videos* hay un atajo “crear ficha de semilla para este video”).

**Clasificación de videos:** cada categoría tiene palabras clave (p. ej. *shader, texturas*). Si el título de un video nuevo las contiene, se asigna a esa sección; puedes cambiarla en *Videos*.

### Frecuencia del respaldo
- Cloudflare ejecuta gratis dos **Cron Triggers** definidos en `wrangler.jsonc`: cada 10 minutos llama a `/api/youtube/sync` (que solo sincroniza si ha pasado la frecuencia elegida en **Panel → Ajustes**) y cada día renueva las notificaciones WebSub.
- Las páginas públicas se generan en cada visita (`dynamic = 'force-dynamic'`), así que no hay cachés que invalidar.

---

## 3. Panel de administración (`/admin`)
- **Semillas:** crear, editar, eliminar, subir captura, edición Java/Bedrock, versión, descripción, coordenadas de estructuras (aldeas, herrerías, mansiones, templos, ciudades antiguas, cámaras de pruebas, puestos de saqueadores…), video relacionado, destacar, borrador.
- **Publicaciones:** artículos para Mods y Add-ons, Shaders y texturas, Tutoriales, Novedades y Todo un Cubo. Portada, galería, enlaces de descarga, vista previa del texto, video relacionado, SEO.
- **Videos:** revisar los importados, ocultarlos, cambiar su sección, destacarlos, sincronizar manualmente.
- **Categorías:** crear, renombrar, ordenar, color y palabras clave.
- **Ajustes:** frecuencia de sincronización, publicación automática, notificaciones, **copia de seguridad en JSON** y estado de la configuración.

## 4. Seguridad
- Las claves secretas (`SUPABASE_SERVICE_ROLE_KEY`, `YOUTUBE_API_KEY`, `CRON_SECRET`, `WEBSUB_SECRET`) solo existen en el servidor (`server-only`); nunca llegan al navegador.
- Row Level Security: el público solo puede **leer** contenido publicado; solo los usuarios de la tabla `admins` pueden escribir o subir imágenes.
- `/admin` protegido por middleware + comprobación de administrador en cada acción.
- Notificaciones de YouTube verificadas con firma HMAC; endpoints de cron protegidos con secreto.
- Cabeceras de seguridad (HSTS, nosniff, frame-options…) y Markdown renderizado sin HTML.

## 5. Copias de seguridad
- **Panel → Ajustes → Descargar copia de seguridad** (JSON con todo el contenido).
- Supabase hace copias diarias automáticas en los planes de pago (Point-in-Time en Pro).
- Copia completa manual de la base de datos: `pg_dump "postgresql://…" > backup.sql` (la cadena está en Project Settings → Database).

## 6. SEO y monetización
- URLs amigables: `/semillas/aldea-en-el-spawn`, `/shaders-y-texturas/mejores-shaders-bedrock`.
- Metadatos por página, Open Graph, canónicas, `noindex` en combinaciones de filtros.
- Datos estructurados: `WebSite` + `SearchAction`, `Article`/`NewsArticle`, `VideoObject`, `BreadcrumbList`.
- `/sitemap.xml`, `/robots.txt`, `/ads.txt` y `manifest` generados automáticamente.
- Imágenes optimizadas (AVIF/WebP, tamaños responsive), reproductor de YouTube que solo carga al pulsar, páginas estáticas con regeneración incremental.
- **AdSense:** pon `NEXT_PUBLIC_ADSENSE_CLIENT` y los IDs de bloque. Los espacios (entre secciones, barra lateral de la biblioteca, final de artículos) no aparecen hasta configurarlos y reservan altura para no mover el contenido.

## 7. Redes sociales
Los enlaces están en [`src/lib/site.ts`](src/lib/site.ts) (TikTok, Instagram, Discord). El de YouTube se toma de `NEXT_PUBLIC_YOUTUBE_URL`; mientras no lo pongas, el botón abre una búsqueda de “TrexxCraft” en YouTube.
TikTok e Instagram no ofrecen una API pública para importar publicaciones sin una app aprobada, así que se integran como enlaces (no se simula ninguna conexión automática).

## 8. Estructura
```
supabase/schema.sql          Base de datos, seguridad y almacenamiento
src/app/(site)/              Web pública (inicio, semillas, videos, categorías, artículos)
src/app/admin/               Panel privado y acciones del servidor
src/app/api/youtube/         Sincronización, WebSub y renovación
src/lib/data.ts              Todas las lecturas públicas
src/lib/youtube.ts           Lógica de importación de YouTube
src/components/GoldBlock.tsx Logotipo (bloque de oro en SVG)
```

*Todo un Cubo no es un producto oficial de Minecraft ni está asociado con Mojang o Microsoft.*
