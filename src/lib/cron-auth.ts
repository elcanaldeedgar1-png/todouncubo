import 'server-only';
import { timingSafeEqual } from 'node:crypto';

/** Acepta `Authorization: Bearer <CRON_SECRET>` (Vercel Cron) o `?secret=` (servicios de cron externos). */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const query = new URL(req.url).searchParams.get('secret') ?? '';
  return safeEqual(header, secret) || safeEqual(query, secret);
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
