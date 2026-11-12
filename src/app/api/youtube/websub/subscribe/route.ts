import { NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { absoluteUrl } from '@/lib/site';
import { websubSubscribe } from '@/lib/youtube';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** (Re)suscribe el sitio a las notificaciones push del canal. Lo llama un cron diario. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await websubSubscribe(absoluteUrl('/api/youtube/websub'));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
