import 'server-only';
import { cache } from 'react';
import { isSupabaseConfigured } from './supabase/env';
import { publicClient } from './supabase/public';
import { demoCategories, demoPosts, demoSeeds, demoVideos } from './demo';
import { STRUCTURE_FILTERS } from './structures';
import { sanitizeSearch } from './utils';
import type { Category, Paged, Post, Seed, Video } from './types';

/**
 * Capa de lectura pública. Todas las consultas pasan por aquí.
 * - Con Supabase configurado: lee de la base de datos (solo contenido publicado, gracias a RLS).
 * - Sin configurar: usa contenido de ejemplo para poder ver el diseño.
 * Ante un error de red/BD se registra y se devuelve vacío para que la página nunca se rompa.
 */

const VIDEO_SELECT = '*, category:categories(slug,name,accent)';
const SEED_LIST_SELECT = 'id,slug,name,seed_code,image_url,description,mc_version,editions,is_featured,published_at,structure_types,video_id,status,created_at,updated_at,seo_title,seo_description';
const SEED_FULL_SELECT = '*, structures:seed_structures(*), video:videos(id,youtube_id,title,url,thumbnail_url,published_at)';
const POST_SELECT = '*, category:categories!inner(slug,name,accent), video:videos(youtube_id,title,url)';

function logError(where: string, error: unknown) {
  console.error(`[data:${where}]`, error);
}

// ─── Categorías ────────────────────────────────────────────────
export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return demoCategories;
  const { data, error } = await publicClient().from('categories').select('*').order('sort_order');
  if (error) logError('categories', error);
  return (data as Category[]) ?? [];
});

export const getCategory = cache(async (slug: string) => (await getCategories()).find((c) => c.slug === slug) ?? null);

// ─── Videos ────────────────────────────────────────────────────
export async function getVideos(opts: { limit?: number; page?: number; categorySlug?: string; featured?: boolean } = {}): Promise<Paged<Video>> {
  const pageSize = opts.limit ?? 12;
  const page = Math.max(1, opts.page ?? 1);
  if (!isSupabaseConfigured) {
    let items = demoVideos;
    if (opts.categorySlug) items = items.filter((v) => v.category?.slug === opts.categorySlug);
    if (opts.featured) items = items.filter((v) => v.is_featured);
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
  }
  const sb = publicClient();
  let q = sb.from('videos').select(VIDEO_SELECT, { count: 'exact' }).eq('status', 'published');
  if (opts.categorySlug) {
    const cat = await getCategory(opts.categorySlug);
    if (!cat) return { items: [], total: 0, page, pageSize };
    q = q.eq('category_id', cat.id);
  }
  if (opts.featured) q = q.eq('is_featured', true);
  const { data, count, error } = await q
    .order('published_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) logError('videos', error);
  return { items: (data as Video[]) ?? [], total: count ?? 0, page, pageSize };
}

export const getVideoByYoutubeId = cache(async (youtubeId: string): Promise<Video | null> => {
  if (!isSupabaseConfigured) return demoVideos.find((v) => v.youtube_id === youtubeId) ?? null;
  const { data, error } = await publicClient().from('videos').select(VIDEO_SELECT).eq('youtube_id', youtubeId).maybeSingle();
  if (error) logError('video', error);
  return (data as Video) ?? null;
});

export async function getSeedsForVideo(videoId: string): Promise<Seed[]> {
  if (!isSupabaseConfigured) return demoSeeds.filter((s) => s.video_id === videoId);
  const { data } = await publicClient().from('seeds').select(SEED_LIST_SELECT).eq('video_id', videoId);
  return (data as Seed[]) ?? [];
}

// ─── Semillas ──────────────────────────────────────────────────
export interface SeedQuery {
  q?: string;
  edition?: string;
  structure?: string;
  version?: string;
  sort?: 'recientes' | 'antiguas' | 'nombre';
  page?: number;
  pageSize?: number;
}

export async function searchSeeds(query: SeedQuery = {}): Promise<Paged<Seed>> {
  const pageSize = query.pageSize ?? 24;
  const page = Math.max(1, query.page ?? 1);
  const q = sanitizeSearch(query.q);
  const group = STRUCTURE_FILTERS.find((f) => f.key === query.structure);
  const edition = query.edition === 'java' || query.edition === 'bedrock' ? query.edition : undefined;

  if (!isSupabaseConfigured) {
    let items = demoSeeds.filter((s) => {
      const hay = `${s.name} ${s.seed_code} ${s.description} ${s.structures?.map((x) => `${x.type} ${x.name ?? ''}`).join(' ')}`.toLowerCase();
      return (!q || hay.includes(q)) && (!edition || s.editions.includes(edition)) && (!group || s.structure_types.some((t) => group.types.includes(t)));
    });
    if (query.sort === 'nombre') items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    if (query.sort === 'antiguas') items = [...items].reverse();
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
  }

  let req = publicClient().from('seeds').select(SEED_LIST_SELECT, { count: 'exact' }).eq('status', 'published');
  if (q) req = req.ilike('search_text', `%${q}%`);
  if (edition) req = req.contains('editions', [edition]);
  if (group) req = req.overlaps('structure_types', group.types);
  if (query.version) req = req.eq('mc_version', query.version);
  if (query.sort === 'nombre') req = req.order('name');
  else req = req.order('published_at', { ascending: query.sort === 'antiguas' });

  const { data, count, error } = await req.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) logError('seeds', error);
  return { items: (data as Seed[]) ?? [], total: count ?? 0, page, pageSize };
}

export async function getFeaturedSeeds(limit = 6): Promise<Seed[]> {
  if (!isSupabaseConfigured) return demoSeeds.slice(0, limit);
  const sb = publicClient();
  const { data, error } = await sb.from('seeds').select(SEED_LIST_SELECT).eq('status', 'published').eq('is_featured', true)
    .order('published_at', { ascending: false }).limit(limit);
  if (error) logError('featuredSeeds', error);
  const featured = (data as Seed[]) ?? [];
  if (featured.length >= limit) return featured;
  // Completa con las más recientes si no hay suficientes destacadas
  const { data: recent } = await sb.from('seeds').select(SEED_LIST_SELECT).eq('status', 'published')
    .order('published_at', { ascending: false }).limit(limit);
  const ids = new Set(featured.map((s) => s.id));
  return [...featured, ...((recent as Seed[]) ?? []).filter((s) => !ids.has(s.id))].slice(0, limit);
}

export const getSeedBySlug = cache(async (slug: string): Promise<Seed | null> => {
  if (!isSupabaseConfigured) return demoSeeds.find((s) => s.slug === slug) ?? null;
  const { data, error } = await publicClient().from('seeds').select(SEED_FULL_SELECT).eq('slug', slug).maybeSingle();
  if (error) logError('seed', error);
  if (!data) return null;
  const seed = data as Seed;
  seed.structures = [...(seed.structures ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return seed;
});

export async function getSeedStats() {
  if (!isSupabaseConfigured) return { seeds: demoSeeds.length, videos: demoVideos.length, posts: demoPosts.length };
  const sb = publicClient();
  const [s, v, p] = await Promise.all([
    sb.from('seeds').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    sb.from('videos').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    sb.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
  ]);
  return { seeds: s.count ?? 0, videos: v.count ?? 0, posts: p.count ?? 0 };
}

// ─── Publicaciones ─────────────────────────────────────────────
export async function getPosts(opts: { categorySlug?: string; limit?: number; page?: number; featured?: boolean; excludeId?: string } = {}): Promise<Paged<Post>> {
  const pageSize = opts.limit ?? 12;
  const page = Math.max(1, opts.page ?? 1);
  if (!isSupabaseConfigured) {
    let items = demoPosts;
    if (opts.categorySlug) items = items.filter((p) => p.category?.slug === opts.categorySlug);
    if (opts.featured) items = items.filter((p) => p.is_featured);
    if (opts.excludeId) items = items.filter((p) => p.id !== opts.excludeId);
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
  }
  let q = publicClient().from('posts').select(POST_SELECT, { count: 'exact' }).eq('status', 'published');
  if (opts.categorySlug) q = q.eq('category.slug', opts.categorySlug);
  if (opts.featured) q = q.eq('is_featured', true);
  if (opts.excludeId) q = q.neq('id', opts.excludeId);
  const { data, count, error } = await q.order('published_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  if (error) logError('posts', error);
  return { items: (data as Post[]) ?? [], total: count ?? 0, page, pageSize };
}

export const getPost = cache(async (categorySlug: string, slug: string): Promise<Post | null> => {
  if (!isSupabaseConfigured) return demoPosts.find((p) => p.slug === slug && p.category?.slug === categorySlug) ?? null;
  const { data, error } = await publicClient().from('posts').select(POST_SELECT).eq('slug', slug).eq('category.slug', categorySlug).maybeSingle();
  if (error) logError('post', error);
  return (data as Post) ?? null;
});

// ─── Sitemap ───────────────────────────────────────────────────
export async function getSitemapEntries() {
  if (!isSupabaseConfigured) {
    return { seeds: demoSeeds, posts: demoPosts, videos: demoVideos };
  }
  const sb = publicClient();
  const [seeds, posts, videos] = await Promise.all([
    sb.from('seeds').select('slug,updated_at').eq('status', 'published').limit(50000),
    sb.from('posts').select('slug,updated_at,category:categories!inner(slug)').eq('status', 'published').limit(50000),
    sb.from('videos').select('youtube_id,updated_at').eq('status', 'published').limit(50000),
  ]);
  return {
    seeds: (seeds.data ?? []) as Pick<Seed, 'slug' | 'updated_at'>[],
    posts: (posts.data ?? []) as unknown as Pick<Post, 'slug' | 'updated_at' | 'category'>[],
    videos: (videos.data ?? []) as Pick<Video, 'youtube_id' | 'updated_at'>[],
  };
}
