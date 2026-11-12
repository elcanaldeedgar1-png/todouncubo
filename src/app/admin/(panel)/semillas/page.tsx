import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/server';
import { Alert } from '@/components/admin/ui';
import { EDITION_LABEL } from '@/lib/structures';
import { formatDate, sanitizeSearch } from '@/lib/utils';
import type { Seed } from '@/lib/types';

const MSG: Record<string, string> = { guardada: 'Semilla guardada.', eliminada: 'Semilla eliminada.' };

export default async function AdminSeeds({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { supabase: sb } = await requireAdmin();
  const q = sanitizeSearch(sp.q);
  const page = Number(sp.pagina) || 1;
  const size = 50;
  let query = sb.from('seeds').select('id,slug,name,seed_code,mc_version,editions,status,is_featured,published_at,structure_types,video_id', { count: 'exact' });
  if (q) query = query.ilike('search_text', `%${q}%`);
  const { data, count } = await query.order('published_at', { ascending: false }).range((page - 1) * size, page * size - 1);
  const seeds = (data ?? []) as Seed[];

  return (
    <div className="max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="pixel-title text-3xl text-bone">Semillas</h1>
          <p className="text-sm text-bone-muted">{count ?? 0} en total</p>
        </div>
        <Link href="/admin/semillas/nueva" className="btn-gold">+ Nueva semilla</Link>
      </header>
      {sp.ok && MSG[sp.ok] && <Alert>{MSG[sp.ok]}</Alert>}
      <form className="flex gap-2">
        <input name="q" defaultValue={sp.q} className="input max-w-md" placeholder="Buscar por nombre, código o estructura…" />
        <button className="btn-stone">Buscar</button>
      </form>
      <div className="block-panel overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-bone-muted">
            <tr className="border-b border-ink-700">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Versión</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {seeds.map((s) => (
              <tr key={s.id} className="border-b border-ink-700/60 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/admin/semillas/${s.id}`} className="font-medium text-bone hover:text-gold-200">{s.name}</Link>
                  <p className="text-xs text-bone-dim">
                    {s.structure_types.length} tipos de estructura {s.is_featured && '· ★ Destacada'} {!s.video_id && '· sin video'}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gold-100">{s.seed_code}</td>
                <td className="px-4 py-3 text-bone-muted">{s.mc_version} · {s.editions.map((e) => EDITION_LABEL[e]).join('/')}</td>
                <td className="px-4 py-3">
                  <span className={s.status === 'published' ? 'chip !text-[#9be27a]' : 'chip'}>{s.status === 'published' ? 'Publicada' : 'Borrador'}</span>
                </td>
                <td className="px-4 py-3 text-bone-muted">{formatDate(s.published_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/semillas/${s.slug}`} target="_blank" className="text-xs text-bone-dim hover:text-gold-200">Ver ↗</Link>
                </td>
              </tr>
            ))}
            {!seeds.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-bone-muted">No hay semillas. ¡Crea la primera!</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {(count ?? 0) > size && (
        <div className="flex gap-2">
          {page > 1 && <Link className="btn-stone" href={`?pagina=${page - 1}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`}>← Anterior</Link>}
          {page * size < (count ?? 0) && <Link className="btn-stone" href={`?pagina=${page + 1}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`}>Siguiente →</Link>}
        </div>
      )}
    </div>
  );
}
