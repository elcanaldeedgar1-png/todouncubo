/**
 * Punto de entrada del Worker de Cloudflare.
 * Usa el Worker que genera OpenNext para servir la web y le añade las tareas programadas (Cron Triggers):
 *   - cada 10 min → /api/youtube/sync (respeta la frecuencia configurada en el panel)
 *   - cada día    → /api/youtube/websub/subscribe (renueva las notificaciones push de YouTube)
 */
// @ts-ignore — el archivo se genera al compilar con `opennextjs-cloudflare build`
import { default as handler } from './.open-next/worker.js';

interface Env {
  CRON_SECRET?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  [key: string]: unknown;
}

interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

interface Ctx {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export default {
  fetch: handler.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: Ctx) {
    if (!env.CRON_SECRET) {
      console.error('[cron] Falta CRON_SECRET');
      return;
    }
    const base = (env.NEXT_PUBLIC_SITE_URL || 'https://todouncubo.workers.dev').replace(/\/$/, '');
    const path = event.cron === '0 5 * * *' ? '/api/youtube/websub/subscribe' : '/api/youtube/sync';
    const req = new Request(`${base}${path}`, { headers: { authorization: `Bearer ${env.CRON_SECRET}` } });
    const res: Response = await handler.fetch(req, env, ctx);
    console.log(`[cron] ${event.cron} ${path} → ${res.status} ${await res.text()}`);
  },
};
