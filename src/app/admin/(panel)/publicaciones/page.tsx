import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/server';
import { Alert } from '@/components/admin/ui';
import { cn, formatDate } from '@/lib/utils';
import type { Category, Post } from '@/lib/types';

const MSG: Record<string, string> = { guardada: 'Publicación guardada.', eliminada: 'Publicación eliminada.' };

export default async function AdminPosts({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { supabase: sb } = await requireAdmin();
  const [{ data: cats }, postsRes] = await Promise.all([
    sb.from('categories').select('*').order('sort_order'),
    (() => {
      let q = sb.from('posts').select('id,slug,title,status,is_featured,published_at,category_id,category:categories(slug,name)').order('published_at', { ascending: false }).limit(200);
      if (sp.categoria) q = q.eq('category_id', sp.categoria);
      return q;
    })(),
  ]);
  const categories = (cats ?? []) as Category[];
  const posts = (postsRes.data ?? []) as unknown as Post[];

  return (
    <div className="max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="pixel-title text-3xl text-bone">Publicaciones</h1>
        <Link href={`/admin/publicaciones/nueva${sp.categoria ? `?categoria=${sp.categoria}` : ''}`} className="btn-gold">+ Nueva publicación</Link>
      </header>
      {sp.ok && MSG[sp.ok] && <Alert>{MSG[sp.ok]}</Alert>}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/publicaciones" className={cn('chip !py-1.5', !sp.categoria && 'chip-active')}>Todas</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/admin/publicaciones?categoria=${c.id}`} className={cn('chip !py-1.5', sp.categoria === c.id && 'chip-active')}>{c.name}</Link>
        ))}
      </div>
      <div className="block-panel divide-y divide-ink-700">
        {posts.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <Link href={`/admin/publicaciones/${p.id}`} className="font-medium text-bone hover:text-gold-200">{p.title}</Link>
              <p className="text-xs text-bone-dim">{p.category?.name} · {formatDate(p.published_at)} {p.is_featured && '· ★ Destacada'}</p>
            </div>
            <span className={p.status === 'published' ? 'chip !text-[#9be27a]' : 'chip'}>{p.status === 'published' ? 'Publicada' : 'Borrador'}</span>
            <Link href={`/${p.category?.slug}/${p.slug}`} target="_blank" className="text-xs text-bone-dim hover:text-gold-200">Ver ↗</Link>
          </div>
        ))}
        {!posts.length && <p className="px-5 py-10 text-center text-sm text-bone-muted">No hay publicaciones todavía.</p>}
      </div>
    </div>
  );
}
