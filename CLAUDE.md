# TodoUnCubo — notas del proyecto

Web de Minecraft de **TrexxCraft** (marca del sitio: **TodoUnCubo**). Biblioteca de semillas con coordenadas,
videos de YouTube importados automáticamente, mods, shaders, tutoriales, novedades y panel de administración.
El usuario no programa: explicar en español, paso a paso, y hacer los cambios técnicos por él.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind 3.
- Supabase (proyecto `qyfwefcrvbdvcumlutbt`): base de datos, Auth, Storage (bucket `media`). Esquema en `supabase/schema.sql` (idempotente).
- Publicado en **Cloudflare Workers** con `@opennextjs/cloudflare`: https://todouncubo.todouncubo.workers.dev
- Sin dominio propio todavía (todouncubo.com estaba libre; el usuario decidió esperar).

## Entorno local (Windows)
- Node está en `C:\Program Files\nodejs` y puede no estar en el PATH: anteponer `$env:Path = "C:\Program Files\nodejs;$env:Path"`.
- Git NO está instalado.
- `.env.local` y `.dev.vars` contienen las claves (no leer en voz alta ni copiar al chat). `.env.development` / `.env.production` solo tienen `NEXT_PUBLIC_SITE_URL`.
- Desarrollo: `npx next dev -p 3001`. Prueba con el motor de Cloudflare: `npx wrangler dev --port 8787 --test-scheduled` (tras `npx opennextjs-cloudflare build`).

## Publicar cambios de código
`npm run deploy` (= `opennextjs-cloudflare build && opennextjs-cloudflare deploy`). Wrangler ya tiene sesión OAuth con la cuenta del usuario.
Las claves de producción están como *secrets* del Worker (`wrangler secret bulk`). Si cambia una clave, volver a subirla.
El contenido creado desde `/admin` NO necesita republicar.

## Decisiones importantes
- Páginas públicas `dynamic = 'force-dynamic'` (en `src/app/(site)/layout.tsx`): sin ISR para no necesitar R2/KV en Cloudflare.
- `images.unoptimized = true` (Cloudflare no optimiza imágenes gratis). Pedir al usuario que comprima las capturas.
- Cron Triggers en `wrangler.jsonc` + `custom-worker.ts`: `*/10 * * * *` → `/api/youtube/sync` (respeta el intervalo del panel), `0 5 * * *` → renovar WebSub.
- YouTube: canal `UCtapyEsJTpD7p46WlILy2gQ` (@TrexxCraft). Sin `YOUTUBE_API_KEY` solo se importan los 15 últimos por RSS.
- La sincronización de YouTube nunca crea semillas; se relacionan desde el panel.
- Supabase rechaza las claves `sb_secret_` si el User-Agent parece un navegador (PowerShell `Invoke-RestMethod` lo parece): usar otro UA o `node` para pruebas.
- Tipografía: Tiny5 (pixelada, títulos grandes) + Inter (texto). Pixelify Sans y Press Start 2P se probaron y descartaron (la «C» de Pixelify parece una «O»; el usuario revirtió Press Start 2P en el título).
- Diseño basado en la referencia del usuario: banner con escena nocturna pixelada en SVG (`src/components/HeroScene.tsx`), 3 paneles, «Explora más», logotipo = bloque de oro SVG (`src/components/GoldBlock.tsx`). Nada de personajes de Mojang (p. ej. Creeper).

## Pendiente / ideas
- Dominio propio (comprar en Cloudflare Registrar, añadir `routes` con `custom_domain` en `wrangler.jsonc`, cambiar `.env.production` y el secret `NEXT_PUBLIC_SITE_URL`, republicar y renovar WebSub).
- Clave de la YouTube Data API v3 para importar el historial completo.
- Google AdSense (variables `NEXT_PUBLIC_ADSENSE_*`), revisar textos de Privacidad y Términos.
- Copia de seguridad del código en GitHub (requiere instalar Git).
