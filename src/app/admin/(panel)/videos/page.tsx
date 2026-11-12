import Image from 'next/image';
import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/server';
import { Alert, SubmitButton } from '@/components/admin/ui';
import { syncNow, updateVideo } from '../../actions';
import { cn, formatDate } from '@/lib/utils';
import type { Category, Video } from '@/lib/types';

const FILTERS = [
  { k: undefined, l: 'Todos' },
  { k: 'sin-revisar', l: 'Sin revisar' },
  { k: 'pendientes', l: 'Pendientes' },
  { k: 'ocultos', l: 'Ocultos' },
  { k: 'sin-categoria', l: 'Sin categoría' },
];

export default async function AdminVideos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { supabase: sb } = await requireAdmin();
  let q = sb.from('videos').select('*').order('published_at', { ascending: false }).limit(100);
  if (sp.filtro === 'sin-revisar') q = q.eq('reviewed', false);
  if (sp.filtro === 'pendientes') q = q.eq('status', 'pending');
  if (sp.filtro === 'ocultos') q = q.eq('status', 'hidden');
  if (sp.filtro === 'sin-categoria') q = q.is('category_id', null);

  const [{ data: vids }, { data: cats }, { data: seedLinks }] = await Promise.all([
    q,
    sb.from('categories').select('*').order('sort_order'),
    sb.from('seeds').select('id,name,video_id').not('video_id', 'is', null),
  ]);
  const videos = (vids ?? []) as Video[];
  const categories = (cats ?? []) as Category[];
  const seedsByVideo = new Map<string, { id: string; name: string }[]>();
  (seedLinks ?? []).forEach((s) => seedsByVideo.set(s.video_id!, [...(seedsByVideo.get(s.video_id!) ?? []), s]));

  return (
    <div className="max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="pixel-title text-3xl text-bone">Videos de YouTube</h1>
          <p className="mt-1 text-sm text-bone-muted">Se importan solos. Aquí puedes revisarlos, ocultarlos, cambiar su sección y relacionarlos con semillas.</p>
        </div>
        <form action={syncNow}>
          <SubmitButton pendingText="Sincronizando…">↻ Sincronizar ahora</SubmitButton>
        </form>
      </header>
      {sp.sync === 'ok' && <Alert>Sincronización completada: {sp.n ?? 0} videos nuevos. {sp.msg}</Alert>}
      {sp.sync === 'error' && <Alert kind="error">La sincronización falló: {sp.msg}</Alert>}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f.l} href={f.k ? `/admin/videos?filtro=${f.k}` : '/admin/videos'} className={cn('chip !py-1.5', sp.filtro === f.k && 'chip-active')}>{f.l}</Link>
        ))}
      </div>

      <div className="space-y-3">
        {videos.map((v) => {
          const linked = seedsByVideo.get(v.id) ?? [];
          return (
            <form key={v.id} action={updateVideo} className={cn('block-panel flex flex-col gap-4 p-4 md:flex-row md:items-center', !v.reviewed && 'border-gold-500/40')}>
              <input type="hidden" name="id" value={v.id} />
              <a href={v.url} target="_blank" rel="noopener noreferrer" className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-ink-800 md:w-44">
                {v.thumbnail_url && <Image src={v.thumbnail_url} alt="" fill sizes="176px" className="object-cover" />}
              </a>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-medium text-bone">{v.title}</p>
                <p className="mt-1 text-xs text-bone-dim">
                  {formatDate(v.published_at)} · vía {v.source} {!v.reviewed && <span className="text-gold-300">· nuevo</span>}
                </p>
                <p className="mt-1 text-xs text-bone-muted">
                  Semillas:{' '}
                  {linked.length
                    ? linked.map((s, i) => <span key={s.id}>{i > 0 && ', '}<Link href={`/admin/semillas/${s.id}`} className="text-gold-300 hover:underline">{s.name}</Link></span>)
                    : <Link href={`/admin/semillas/nueva?video=${v.id}`} className="text-gold-300 hover:underline">+ crear ficha de semilla para este video</Link>}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:w-[380px] md:grid-cols-[1fr_1fr_auto]">
                <select name="category_id" defaultValue={v.category_id ?? ''} className="input !py-2 text-xs" aria-label="Categoría">
                  <option value="">Sin categoría</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="status" defaultValue={v.status} className="input !py-2 text-xs" aria-label="Estado">
                  <option value="published">Visible</option>
                  <option value="pending">Pendiente</option>
                  <option value="hidden">Oculto</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs text-bone-muted">
                  <input type="checkbox" name="is_featured" defaultChecked={v.is_featured} className="accent-[#f9c623]" /> ★
                </label>
                <SubmitButton className="col-span-2 !py-2 !text-xs md:col-span-3">{v.reviewed ? 'Guardar' : 'Guardar y marcar revisado'}</SubmitButton>
              </div>
            </form>
          );
        })}
        {!videos.length && (
          <p className="block-panel px-5 py-10 text-center text-sm text-bone-muted">
            No hay videos aquí. Comprueba que <code>YOUTUBE_CHANNEL_ID</code> está configurado y pulsa “Sincronizar ahora”.
          </p>
        )}
      </div>
    </div>
  );
}
