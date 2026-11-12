import { createHmac } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { safeEqual } from '@/lib/cron-auth';
import { parseYoutubeAtom, runSync, upsertVideos, websubTopic } from '@/lib/youtube';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Verificación de la suscripción: el hub de YouTube envía un challenge que debemos devolver. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const topic = sp.get('hub.topic');
  const challenge = sp.get('hub.challenge');
  if (!challenge || topic !== websubTopic()) return new Response('Tema no válido', { status: 404 });
  return new Response(challenge, { status: 200, headers: { 'content-type': 'text/plain' } });
}

/** Notificación de video nuevo o actualizado. */
export async function POST(req: Request) {
  const body = await req.text();

  const secret = process.env.WEBSUB_SECRET;
  if (secret) {
    const sig = req.headers.get('x-hub-signature') ?? '';
    const [algo, hex] = sig.split('=');
    if (!hex || !['sha1', 'sha256'].includes(algo)) return new Response('Firma ausente', { status: 403 });
    const expected = createHmac(algo, secret).update(body).digest('hex');
    // Según la especificación se responde 2xx igualmente, pero ignoramos el contenido
    if (!safeEqual(hex, expected)) return new Response('ok', { status: 202 });
  }

  try {
    const videos = parseYoutubeAtom(body);
    if (videos.length) {
      const r = await upsertVideos(videos, 'websub');
      if (r.inserted || r.updated) revalidatePath('/', 'layout');
    }
    // Completa los datos (descripción, miniatura en alta) con una sincronización normal
    await runSync('websub');
  } catch (e) {
    console.error('[websub]', e);
  }
  return new Response('ok', { status: 200 });
}
