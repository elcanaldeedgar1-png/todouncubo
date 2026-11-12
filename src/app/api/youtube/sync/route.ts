import { NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { runSync } from '@/lib/youtube';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Consulta periódica (respaldo de las notificaciones push).
 * Llama a este endpoint cada pocos minutos desde Vercel Cron, Supabase pg_cron o cron-job.org;
 * respeta el intervalo configurado en el panel salvo que pases ?force=1. ?full=1 importa todo el historial.
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const result = await runSync('cron', { respectInterval: sp.get('force') !== '1', full: sp.get('full') === '1' });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
