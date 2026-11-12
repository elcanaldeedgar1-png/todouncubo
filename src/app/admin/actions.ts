'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin, sessionClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { runSync, websubSubscribe } from '@/lib/youtube';
import { absoluteUrl } from '@/lib/site';
import { STRUCTURES } from '@/lib/structures';
import { slugify } from '@/lib/utils';

export type ActionState = { error?: string; ok?: string } | undefined;

type SB = Awaited<ReturnType<typeof sessionClient>>;

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === 'string' && v.trim() ? v.trim() : null;
};

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'];

async function uploadImage(sb: SB, file: FormDataEntryValue | null, folder: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!ALLOWED.includes(file.type)) throw new Error('Formato de imagen no permitido (usa PNG, JPG, WEBP, AVIF o GIF).');
  if (file.size > 8 * 1024 * 1024) throw new Error('La imagen supera 8 MB.');
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${folder}/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}-${slugify(file.name.replace(/\.[^.]+$/, '')).slice(0, 40)}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
  if (error) throw new Error(`Error al subir la imagen: ${error.message}`);
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}

function friendly(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    if (error.message.includes('seed_code')) return 'Ya existe una semilla con ese código y esa versión.';
    if (error.message.includes('slug')) return 'Ya existe otro contenido con esa URL (slug). Cambia el slug.';
    return 'Ese contenido ya existe (duplicado).';
  }
  if (error.code === '23514') return 'Algún dato no tiene el formato correcto (revisa el slug o la edición).';
  if (error.code === '23503') return 'No se puede eliminar porque hay contenido que depende de este elemento.';
  return error.message;
}

const refresh = () => revalidatePath('/', 'layout');

// ─── Sesión ────────────────────────────────────────────────────
export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { error: 'Configura Supabase en las variables de entorno para usar el panel.' };
  const email = str(fd, 'email');
  const password = str(fd, 'password');
  if (!email || !password) return { error: 'Escribe tu correo y contraseña.' };
  const sb = await sessionClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Correo o contraseña incorrectos.' };
  const next = str(fd, 'next');
  redirect(next?.startsWith('/admin') ? next : '/admin');
}

export async function logout() {
  const sb = await sessionClient();
  await sb.auth.signOut();
  redirect('/admin/login');
}

// ─── Semillas ──────────────────────────────────────────────────
export async function saveSeed(_: ActionState, fd: FormData): Promise<ActionState> {
  let target = '/admin/semillas?ok=guardada';
  try {
    const { supabase: sb } = await requireAdmin();
    const id = str(fd, 'id');
    const name = str(fd, 'name');
    const seed_code = str(fd, 'seed_code');
    const mc_version = str(fd, 'mc_version');
    const editions = fd.getAll('editions').filter((e): e is string => e === 'java' || e === 'bedrock');
    if (!name || !seed_code || !mc_version) return { error: 'Nombre, código y versión son obligatorios.' };
    if (!editions.length) return { error: 'Marca al menos una edición (Java o Bedrock).' };

    let structures: { type: string; name: string | null; x: number; y: number | null; z: number; dimension: string; notes: string | null }[] = [];
    try {
      structures = JSON.parse(str(fd, 'structures') ?? '[]');
    } catch {
      return { error: 'Las coordenadas no son válidas.' };
    }
    structures = structures.filter((s) => STRUCTURES[s.type] && Number.isFinite(s.x) && Number.isFinite(s.z));

    const image = await uploadImage(sb, fd.get('image'), 'semillas');
    const row = {
      name,
      slug: slugify(str(fd, 'slug') ?? name),
      seed_code,
      mc_version,
      editions,
      description: str(fd, 'description'),
      image_url: image ?? str(fd, 'image_url'),
      video_id: str(fd, 'video_id'),
      status: str(fd, 'status') === 'draft' ? 'draft' : 'published',
      is_featured: fd.get('is_featured') === 'on',
      published_at: str(fd, 'published_at') ? new Date(str(fd, 'published_at')!).toISOString() : new Date().toISOString(),
      seo_title: str(fd, 'seo_title'),
      seo_description: str(fd, 'seo_description'),
    };

    const { data, error } = id
      ? await sb.from('seeds').update(row).eq('id', id).select('id').single()
      : await sb.from('seeds').insert(row).select('id').single();
    if (error) return { error: friendly(error) };

    // Reemplaza las estructuras
    const { error: delErr } = await sb.from('seed_structures').delete().eq('seed_id', data.id);
    if (delErr) return { error: friendly(delErr) };
    if (structures.length) {
      const { error: insErr } = await sb.from('seed_structures').insert(
        structures.map((s, i) => ({ ...s, seed_id: data.id, sort_order: i, y: Number.isFinite(s.y) ? s.y : null })),
      );
      if (insErr) return { error: friendly(insErr) };
    }
    refresh();
    if (!id) target = `/admin/semillas/${data.id}?ok=creada`;
  } catch (e) {
    return { error: (e as Error).message };
  }
  redirect(target);
}

export async function deleteSeed(fd: FormData) {
  const { supabase: sb } = await requireAdmin();
  await sb.from('seeds').delete().eq('id', String(fd.get('id')));
  refresh();
  redirect('/admin/semillas?ok=eliminada');
}

// ─── Publicaciones ─────────────────────────────────────────────
export async function savePost(_: ActionState, fd: FormData): Promise<ActionState> {
  let target = '/admin/publicaciones?ok=guardada';
  try {
    const { supabase: sb } = await requireAdmin();
    const id = str(fd, 'id');
    const title = str(fd, 'title');
    const category_id = str(fd, 'category_id');
    if (!title || !category_id) return { error: 'El título y la categoría son obligatorios.' };

    const cover = await uploadImage(sb, fd.get('cover'), 'publicaciones');
    const newGallery: string[] = [];
    for (const f of fd.getAll('gallery_files')) {
      const url = await uploadImage(sb, f, 'galeria');
      if (url) newGallery.push(url);
    }
    const gallery = [...(str(fd, 'gallery') ?? '').split('\n').map((l) => l.trim()).filter((l) => /^https?:\/\//.test(l)), ...newGallery];
    const links = (str(fd, 'links') ?? '')
      .split('\n')
      .map((l) => l.split('|').map((x) => x.trim()))
      .filter(([label, url]) => label && url && /^https?:\/\//.test(url))
      .map(([label, url]) => ({ label, url }));

    const row = {
      title,
      slug: slugify(str(fd, 'slug') ?? title),
      category_id,
      excerpt: str(fd, 'excerpt'),
      content: str(fd, 'content') ?? '',
      cover_url: cover ?? str(fd, 'cover_url'),
      gallery,
      links,
      video_id: str(fd, 'video_id'),
      status: str(fd, 'status') === 'draft' ? 'draft' : 'published',
      is_featured: fd.get('is_featured') === 'on',
      published_at: str(fd, 'published_at') ? new Date(str(fd, 'published_at')!).toISOString() : new Date().toISOString(),
      seo_title: str(fd, 'seo_title'),
      seo_description: str(fd, 'seo_description'),
    };
    const { data, error } = id
      ? await sb.from('posts').update(row).eq('id', id).select('id').single()
      : await sb.from('posts').insert(row).select('id').single();
    if (error) return { error: friendly(error) };
    refresh();
    if (!id) target = `/admin/publicaciones/${data.id}?ok=creada`;
  } catch (e) {
    return { error: (e as Error).message };
  }
  redirect(target);
}

export async function deletePost(fd: FormData) {
  const { supabase: sb } = await requireAdmin();
  await sb.from('posts').delete().eq('id', String(fd.get('id')));
  refresh();
  redirect('/admin/publicaciones?ok=eliminada');
}

// ─── Videos ────────────────────────────────────────────────────
export async function updateVideo(fd: FormData) {
  const { supabase: sb } = await requireAdmin();
  const status = String(fd.get('status'));
  await sb
    .from('videos')
    .update({
      status: ['pending', 'published', 'hidden'].includes(status) ? status : 'published',
      category_id: str(fd, 'category_id'),
      is_featured: fd.get('is_featured') === 'on',
      reviewed: true,
    })
    .eq('id', String(fd.get('id')));
  refresh();
}

export async function syncNow(): Promise<void> {
  await requireAdmin();
  const r = await runSync('manual', { full: true });
  refresh();
  redirect(`/admin/videos?sync=${r.ok ? 'ok' : 'error'}&msg=${encodeURIComponent(r.message ?? '')}&n=${r.inserted}`);
}

// ─── Categorías ────────────────────────────────────────────────
export async function saveCategory(fd: FormData) {
  const { supabase: sb } = await requireAdmin();
  const id = str(fd, 'id');
  const name = str(fd, 'name');
  if (!name) return;
  const row = {
    name,
    slug: slugify(str(fd, 'slug') ?? name),
    description: str(fd, 'description'),
    accent: ['gold', 'grass', 'diamond', 'redstone', 'stone'].includes(String(fd.get('accent'))) ? String(fd.get('accent')) : 'gold',
    sort_order: Number(fd.get('sort_order')) || 0,
    video_keywords: (str(fd, 'video_keywords') ?? '').split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
  };
  const { error } = id ? await sb.from('categories').update(row).eq('id', id) : await sb.from('categories').insert(row);
  refresh();
  redirect(`/admin/categorias?${error ? `error=${encodeURIComponent(friendly(error))}` : 'ok=guardada'}`);
}

export async function deleteCategory(fd: FormData) {
  const { supabase: sb } = await requireAdmin();
  const { error } = await sb.from('categories').delete().eq('id', String(fd.get('id')));
  refresh();
  redirect(`/admin/categorias?${error ? `error=${encodeURIComponent(friendly(error))}` : 'ok=eliminada'}`);
}

// ─── Ajustes ───────────────────────────────────────────────────
export async function saveSettings(fd: FormData) {
  const { supabase: sb } = await requireAdmin();
  const interval = Math.min(1440, Math.max(5, Number(fd.get('sync_interval_minutes')) || 30));
  await sb.from('settings').upsert([
    { key: 'sync_interval_minutes', value: interval },
    { key: 'auto_publish_videos', value: fd.get('auto_publish_videos') === 'on' },
  ]);
  redirect('/admin/ajustes?ok=guardado');
}

export async function subscribePush() {
  await requireAdmin();
  let msg = 'ok=suscrito';
  try {
    await websubSubscribe(absoluteUrl('/api/youtube/websub'));
  } catch (e) {
    msg = `error=${encodeURIComponent((e as Error).message)}`;
  }
  redirect(`/admin/ajustes?${msg}`);
}
