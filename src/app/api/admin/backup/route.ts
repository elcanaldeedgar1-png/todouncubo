import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const TABLES = ['categories', 'videos', 'seeds', 'seed_structures', 'posts', 'settings'] as const;

/** Exporta todo el contenido como JSON (solo administradores). */
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const out: Record<string, unknown[]> = {};
  for (const t of TABLES) {
    const rows: unknown[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await admin.supabase.from(t).select('*').range(from, from + 999);
      if (error) return NextResponse.json({ error: `${t}: ${error.message}` }, { status: 500 });
      rows.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    out[t] = rows;
  }

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), version: 1, data: out }, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="todouncubo-backup-${stamp}.json"`,
      'cache-control': 'no-store',
    },
  });
}
