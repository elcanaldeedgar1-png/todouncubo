import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export default async function AdminHome() {
  const { supabase: sb } = await requireAdmin();
  const count = (t: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const q = sb.from(t).select('id', { count: 'exact', head: true });
    return f ? f(q) : q;
  };
  const [seeds, posts, videos, pending, logs] = await Promise.all([
    count('seeds'),
    count('posts'),
    count('videos'),
    count('videos', (q) => q.eq('reviewed', false)),
    sb.from('sync_logs').select('*').order('started_at', { ascending: false }).limit(5),
  ]);

  const cards = [
    { label: 'Semillas', value: seeds.count ?? 0, href: '/admin/semillas', cta: '+ Nueva semilla', ctaHref: '/admin/semillas/nueva' },
    { label: 'Publicaciones', value: posts.count ?? 0, href: '/admin/publicaciones', cta: '+ Nueva publicación', ctaHref: '/admin/publicaciones/nueva' },
    { label: 'Videos', value: videos.count ?? 0, href: '/admin/videos', cta: 'Revisar videos', ctaHref: '/admin/videos?filtro=sin-revisar' },
    { label: 'Videos sin revisar', value: pending.count ?? 0, href: '/admin/videos?filtro=sin-revisar', cta: 'Revisar', ctaHref: '/admin/videos?filtro=sin-revisar' },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      <header>
        <h1 className="pixel-title text-3xl text-bone">Resumen</h1>
        <p className="mt-1 text-sm text-bone-muted">Todo lo que guardes aquí aparece en la web al instante.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="block-panel p-5">
            <Link href={c.href} className="text-xs uppercase tracking-wider text-bone-muted hover:text-gold-200">{c.label}</Link>
            <p className="pixel-title mt-3 text-2xl text-gold-200">{c.value}</p>
            <Link href={c.ctaHref} className="mt-3 inline-block text-sm font-semibold text-gold-300 hover:text-gold-100">{c.cta} →</Link>
          </div>
        ))}
      </div>
      <section className="block-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4">
          <h2 className="font-semibold text-bone">Últimas sincronizaciones de YouTube</h2>
          <Link href="/admin/videos" className="text-sm text-gold-300 hover:text-gold-100">Ir a videos →</Link>
        </div>
        {logs.data?.length ? (
          <ul className="divide-y divide-ink-700 text-sm">
            {logs.data.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <span className={l.ok ? 'text-[#9be27a]' : 'text-[#ff8b80]'}>{l.ok ? '●' : '✕'}</span>
                <span className="text-bone">{formatDate(l.started_at)} {new Date(l.started_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="chip">{l.trigger}</span>
                {l.source && <span className="chip">{l.source}</span>}
                <span className="text-bone-muted">+{l.inserted} nuevos · {l.updated} actualizados</span>
                {l.message && <span className="truncate text-xs text-bone-dim">{l.message}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-bone-muted">Aún no hay sincronizaciones. Pulsa “Sincronizar ahora” en Videos.</p>
        )}
      </section>
    </div>
  );
}
