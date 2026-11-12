'use client';
import { useActionState, useState } from 'react';
import { savePost } from '@/app/admin/actions';
import { slugify } from '@/lib/utils';
import type { Category, Post, Video } from '@/lib/types';
import Markdown from '@/components/Markdown';
import { Alert, PendingButton, useNoResetSubmit } from './ui';
import ImageField from './ImageField';

const toLocal = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function PostForm({
  post,
  categories,
  videos,
  defaultCategory,
}: {
  post: Post | null;
  categories: Category[];
  videos: Pick<Video, 'id' | 'title' | 'published_at'>[];
  defaultCategory?: string;
}) {
  const [state, action, pending] = useActionState(savePost, undefined);
  const onSubmit = useNoResetSubmit(action);
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [content, setContent] = useState(post?.content ?? '');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      {post && <input type="hidden" name="id" value={post.id} />}

      <section className="block-panel grid gap-5 p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label" htmlFor="title">Título *</label>
          <input
            id="title"
            name="title"
            required
            className="input text-base"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div>
          <label className="label" htmlFor="category_id">Categoría *</label>
          <select id="category_id" name="category_id" required defaultValue={post?.category_id ?? defaultCategory ?? categories[0]?.id} className="input">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="slug">URL amigable</label>
          <input id="slug" name="slug" className="input" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="excerpt">Resumen corto</label>
          <textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ''} className="input" placeholder="Una o dos frases que se ven en las tarjetas." />
        </div>
        <div className="md:col-span-2">
          <ImageField name="cover" currentName="cover_url" current={post?.cover_url} label="Imagen de portada" />
        </div>
      </section>

      <section className="block-panel p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-bone">Contenido</h2>
          <div className="flex gap-1 rounded-lg border border-ink-600 p-1 text-xs">
            {(['edit', 'preview'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-3 py-1 ${tab === t ? 'bg-gold-400/20 text-gold-200' : 'text-bone-muted'}`}>
                {t === 'edit' ? 'Escribir' : 'Vista previa'}
              </button>
            ))}
          </div>
        </div>
        <textarea
          name="content"
          rows={18}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`input font-mono text-[13px] leading-6 ${tab === 'preview' ? 'hidden' : ''}`}
          placeholder={'## Subtítulo\n\nTexto normal, **negrita**, [enlace](https://...)\n\n- Lista\n- de puntos\n\n![imagen](https://...)'}
        />
        {tab === 'preview' && <div className="min-h-[300px] rounded-lg border border-ink-600 bg-ink-900 p-5"><Markdown>{content || '_Nada que mostrar todavía._'}</Markdown></div>}
        <p className="mt-2 text-xs text-bone-dim">Formato sencillo: ## para títulos, **negrita**, - para listas, [texto](enlace) para enlaces.</p>
      </section>

      <section className="block-panel grid gap-5 p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label" htmlFor="links">Enlaces (uno por línea: Texto | URL)</label>
          <textarea
            id="links"
            name="links"
            rows={3}
            defaultValue={post?.links.map((l) => `${l.label} | ${l.url}`).join('\n')}
            className="input font-mono text-[13px]"
            placeholder={'Descargar para Java | https://...\nDescargar para Bedrock | https://...'}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="gallery">Galería de imágenes</label>
          <input type="file" name="gallery_files" multiple accept="image/png,image/jpeg,image/webp,image/avif,image/gif" className="mb-3 block w-full text-sm text-bone-muted file:mr-4 file:rounded-lg file:border-0 file:bg-ink-600 file:px-4 file:py-2 file:font-semibold file:text-bone" />
          <textarea id="gallery" name="gallery" rows={3} defaultValue={post?.gallery.join('\n')} className="input font-mono text-[12px]" placeholder="URLs de imágenes ya subidas (una por línea). Borra una línea para quitarla." />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="video_id">Video relacionado</label>
          <select id="video_id" name="video_id" defaultValue={post?.video_id ?? ''} className="input">
            <option value="">— Sin video —</option>
            {videos.map((v) => <option key={v.id} value={v.id}>{new Date(v.published_at).toLocaleDateString('es-ES')} · {v.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">Estado</label>
          <select id="status" name="status" defaultValue={post?.status ?? 'published'} className="input">
            <option value="published">Publicada</option>
            <option value="draft">Borrador (oculta)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="published_at">Fecha de publicación</label>
          <input id="published_at" name="published_at" type="datetime-local" defaultValue={toLocal(post?.published_at)} className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm text-bone md:col-span-2">
          <input type="checkbox" name="is_featured" defaultChecked={post?.is_featured} className="h-4 w-4 accent-[#f9c623]" /> ★ Destacar
        </label>
        <details className="md:col-span-2">
          <summary className="cursor-pointer text-sm font-semibold text-bone-muted hover:text-gold-200">SEO (opcional)</summary>
          <div className="mt-4 grid gap-4">
            <input name="seo_title" defaultValue={post?.seo_title ?? ''} className="input" placeholder="Título para Google" maxLength={70} />
            <textarea name="seo_description" defaultValue={post?.seo_description ?? ''} className="input" rows={2} placeholder="Descripción para Google (máx. 160)" maxLength={160} />
          </div>
        </details>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <PendingButton pending={pending} className="!px-8 !py-3 shadow-gold">{post ? 'Guardar cambios' : 'Publicar'}</PendingButton>
      </div>
    </form>
  );
}
