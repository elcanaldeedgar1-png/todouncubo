import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/server';
import PostForm from '@/components/admin/PostForm';
import { Alert, ConfirmButton } from '@/components/admin/ui';
import { deletePost } from '../../../actions';
import type { Category, Post, Video } from '@/lib/types';

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; categoria?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase: sb } = await requireAdmin();
  const isNew = id === 'nueva';
  const [{ data: post }, { data: cats }, { data: videos }] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : sb.from('posts').select('*, category:categories(slug,name,accent)').eq('id', id).maybeSingle(),
    sb.from('categories').select('*').order('sort_order'),
    sb.from('videos').select('id,title,published_at').order('published_at', { ascending: false }).limit(500),
  ]);
  if (!isNew && !post) notFound();
  const p = post as Post | null;

  return (
    <div className="max-w-5xl space-y-6">
      <Link href="/admin/publicaciones" className="text-sm text-bone-muted hover:text-gold-200">← Publicaciones</Link>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="pixel-title text-3xl text-bone">{isNew ? 'Nueva publicación' : 'Editar publicación'}</h1>
        {p && (
          <div className="flex gap-2">
            <Link href={`/${p.category?.slug}/${p.slug}`} target="_blank" className="btn-stone">Ver en la web ↗</Link>
            <form action={deletePost}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message="¿Eliminar esta publicación? No se puede deshacer.">Eliminar</ConfirmButton>
            </form>
          </div>
        )}
      </header>
      {sp.ok === 'creada' && <Alert>Publicación creada. Ya aparece en la web.</Alert>}
      <PostForm post={p} categories={(cats ?? []) as Category[]} videos={(videos ?? []) as Pick<Video, 'id' | 'title' | 'published_at'>[]} defaultCategory={sp.categoria} />
    </div>
  );
}
