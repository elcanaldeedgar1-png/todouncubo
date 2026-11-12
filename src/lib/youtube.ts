import 'server-only';
import { XMLParser } from 'fast-xml-parser';
import { revalidatePath } from 'next/cache';
import { serviceClient } from './supabase/server';
import type { Category } from './types';

/**
 * Sincronización de YouTube → Supabase.
 *
 * Fuentes (en orden):
 *   1. YouTube Data API v3 (si hay YOUTUBE_API_KEY): lista completa de subidas, paginada.
 *   2. Feed RSS público del canal (respaldo, sin clave): últimos 15 videos.
 *
 * Garantías:
 *   - Sin duplicados: youtube_id es UNIQUE y se hace upsert.
 *   - Solo actualiza datos que vienen de YouTube (título, descripción, miniatura, fecha).
 *     Nunca pisa lo que decides en el panel (categoría, estado, destacado, semillas relacionadas).
 *   - Nunca crea ni modifica semillas: eso se hace a mano desde el panel.
 */

export interface YtVideo {
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  url: string;
  published_at: string;
}

export interface SyncResult {
  ok: boolean;
  source: 'api' | 'rss' | null;
  inserted: number;
  updated: number;
  skipped?: boolean;
  message?: string;
}

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID?.trim();
const API_KEY = process.env.YOUTUBE_API_KEY?.trim();
const YT_ID = /^[A-Za-z0-9_-]{11}$/;

const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

// ─── Fuente 1: YouTube Data API v3 ─────────────────────────────
async function fetchFromApi(maxPages = 20): Promise<YtVideo[]> {
  if (!API_KEY || !CHANNEL_ID) throw new Error('API de YouTube no configurada');
  // La lista "uploads" de un canal es su ID con el prefijo UC → UU
  const uploads = `UU${CHANNEL_ID.slice(2)}`;
  const out: YtVideo[] = [];
  let pageToken = '';
  for (let i = 0; i < maxPages; i++) {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet,contentDetails,status');
    url.searchParams.set('playlistId', uploads);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`YouTube API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = (await res.json()) as {
      nextPageToken?: string;
      items: {
        snippet: { title: string; description: string; thumbnails: Record<string, { url: string }>; resourceId: { videoId: string } };
        contentDetails: { videoId: string; videoPublishedAt?: string };
        status?: { privacyStatus?: string };
      }[];
    };
    for (const it of json.items ?? []) {
      const id = it.contentDetails?.videoId ?? it.snippet.resourceId.videoId;
      if (!YT_ID.test(id) || it.status?.privacyStatus !== 'public' || !it.contentDetails.videoPublishedAt) continue;
      const t = it.snippet.thumbnails;
      out.push({
        youtube_id: id,
        title: it.snippet.title,
        description: it.snippet.description || null,
        thumbnail_url: (t.maxres ?? t.standard ?? t.high ?? t.medium ?? t.default)?.url ?? null,
        url: watchUrl(id),
        published_at: it.contentDetails.videoPublishedAt,
      });
    }
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }
  return out;
}

// ─── Fuente 2: RSS público ─────────────────────────────────────
const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

export function parseYoutubeAtom(body: string): YtVideo[] {
  const doc = xml.parse(body);
  const raw = doc?.feed?.entry;
  const entries: Record<string, unknown>[] = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
  return entries
    .map((e) => {
      const id = String(e['yt:videoId'] ?? '');
      const group = (e['media:group'] ?? {}) as Record<string, unknown>;
      const thumb = group['media:thumbnail'] as { '@_url'?: string } | undefined;
      const desc = group['media:description'];
      return {
        youtube_id: id,
        title: String(e.title ?? ''),
        description: typeof desc === 'string' && desc ? desc : null,
        thumbnail_url: thumb?.['@_url'] ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        url: watchUrl(id),
        published_at: String(e.published ?? new Date().toISOString()),
      };
    })
    .filter((v) => YT_ID.test(v.youtube_id) && v.title);
}

async function fetchFromRss(): Promise<YtVideo[]> {
  if (!CHANNEL_ID) throw new Error('Falta YOUTUBE_CHANNEL_ID');
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  return parseYoutubeAtom(await res.text());
}

// ─── Clasificación automática por palabras clave ───────────────
function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function guessCategory(video: Pick<YtVideo, 'title' | 'description'>, categories: Category[]): string | null {
  const title = normalize(video.title);
  const desc = normalize(video.description ?? '').slice(0, 500);
  let best: { id: string; score: number } | null = null;
  for (const c of categories) {
    let score = 0;
    for (const kw of c.video_keywords) {
      const k = normalize(kw).trim();
      if (!k) continue;
      const re = new RegExp(`(^|[^a-z0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`);
      if (re.test(title)) score += 3;
      else if (re.test(desc)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { id: c.id, score };
  }
  return best?.id ?? null;
}

// ─── Guardado sin duplicados ───────────────────────────────────
export async function upsertVideos(videos: YtVideo[], source: 'api' | 'rss' | 'websub') {
  const sb = serviceClient();
  if (!videos.length) return { inserted: 0, updated: 0 };

  // Quita duplicados dentro del mismo lote
  const unique = [...new Map(videos.map((v) => [v.youtube_id, v])).values()];
  const ids = unique.map((v) => v.youtube_id);

  const existing = new Map<string, YtVideo>();
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await sb
      .from('videos')
      .select('youtube_id,title,description,thumbnail_url,url,published_at')
      .in('youtube_id', ids.slice(i, i + 200));
    if (error) throw error;
    (data as YtVideo[] | null)?.forEach((r) => existing.set(r.youtube_id, r));
  }

  const [{ data: cats }, { data: auto }] = await Promise.all([
    sb.from('categories').select('*'),
    sb.from('settings').select('value').eq('key', 'auto_publish_videos').maybeSingle(),
  ]);
  const autoPublish = auto?.value !== false;

  const fresh = unique.filter((v) => !existing.has(v.youtube_id));
  const known = unique.filter((v) => existing.has(v.youtube_id));

  if (fresh.length) {
    const rows = fresh.map((v) => ({
      ...v,
      source,
      status: autoPublish ? 'published' : 'pending',
      category_id: guessCategory(v, (cats as Category[]) ?? []),
    }));
    // ignoreDuplicates protege frente a dos sincronizaciones simultáneas
    const { error } = await sb.from('videos').upsert(rows, { onConflict: 'youtube_id', ignoreDuplicates: true });
    if (error) throw error;
  }

  // Actualiza solo los campos que provienen de YouTube y solo si cambiaron
  let updated = 0;
  for (const v of known) {
    const old = existing.get(v.youtube_id)!;
    const patch: Partial<YtVideo> = {};
    if (v.title !== old.title) patch.title = v.title;
    // Las notificaciones push no traen descripción ni miniatura buena: no sobrescribimos con vacío
    if (v.description && v.description !== old.description) patch.description = v.description;
    if (v.thumbnail_url && source !== 'websub' && v.thumbnail_url !== old.thumbnail_url) patch.thumbnail_url = v.thumbnail_url;
    if (new Date(v.published_at).getTime() !== new Date(old.published_at).getTime()) patch.published_at = v.published_at;
    if (!Object.keys(patch).length) continue;
    const { error } = await sb.from('videos').update(patch).eq('youtube_id', v.youtube_id);
    if (error) throw error;
    updated++;
  }

  return { inserted: fresh.length, updated };
}

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const { data } = await serviceClient().from('settings').select('value').eq('key', key).maybeSingle();
  return (data?.value ?? fallback) as T;
}

/**
 * Ejecuta una sincronización completa con registro en sync_logs.
 * Si `respectInterval` es true, se salta cuando la última sincronización es más reciente
 * que el intervalo configurado en el panel (permite un cron frecuente con frecuencia ajustable).
 */
export async function runSync(trigger: 'cron' | 'websub' | 'manual', opts: { respectInterval?: boolean; full?: boolean } = {}): Promise<SyncResult> {
  if (!CHANNEL_ID) return { ok: false, source: null, inserted: 0, updated: 0, message: 'Falta YOUTUBE_CHANNEL_ID' };
  const sb = serviceClient();

  if (opts.respectInterval) {
    const [interval, last] = await Promise.all([getSetting<number>('sync_interval_minutes', 30), getSetting<string | null>('last_sync_at', null)]);
    if (last && Date.now() - new Date(last).getTime() < Number(interval) * 60000) {
      return { ok: true, source: null, inserted: 0, updated: 0, skipped: true, message: 'Aún no toca sincronizar' };
    }
  }

  const { data: log } = await sb.from('sync_logs').insert({ trigger }).select('id').single();
  let result: SyncResult;

  try {
    let videos: YtVideo[] = [];
    let source: 'api' | 'rss' = 'rss';
    let note = '';
    if (API_KEY) {
      try {
        videos = await fetchFromApi(opts.full ? 40 : 2);
        source = 'api';
      } catch (e) {
        note = `API falló (${(e as Error).message}); usando RSS. `;
        videos = await fetchFromRss();
      }
    } else {
      videos = await fetchFromRss();
    }
    const { inserted, updated } = await upsertVideos(videos, source);
    result = { ok: true, source, inserted, updated, message: `${note}${videos.length} videos revisados` };
  } catch (e) {
    result = { ok: false, source: null, inserted: 0, updated: 0, message: (e as Error).message };
  }

  await Promise.all([
    log && sb.from('sync_logs').update({ finished_at: new Date().toISOString(), ok: result.ok, source: result.source, inserted: result.inserted, updated: result.updated, message: result.message }).eq('id', log.id),
    result.ok && sb.from('settings').upsert({ key: 'last_sync_at', value: new Date().toISOString() }),
  ]);

  if (result.ok && (result.inserted || result.updated)) {
    revalidatePath('/', 'layout');
  }
  return result;
}

// ─── WebSub (notificaciones push de YouTube) ───────────────────
export const WEBSUB_HUB = 'https://pubsubhubbub.appspot.com/subscribe';
export const websubTopic = () => `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export async function websubSubscribe(callbackUrl: string, mode: 'subscribe' | 'unsubscribe' = 'subscribe') {
  if (!CHANNEL_ID) throw new Error('Falta YOUTUBE_CHANNEL_ID');
  const body = new URLSearchParams({
    'hub.callback': callbackUrl,
    'hub.topic': websubTopic(),
    'hub.verify': 'async',
    'hub.mode': mode,
    'hub.lease_seconds': String(60 * 60 * 24 * 5), // 5 días; el cron diario la renueva
  });
  if (process.env.WEBSUB_SECRET) body.set('hub.secret', process.env.WEBSUB_SECRET);
  const res = await fetch(WEBSUB_HUB, { method: 'POST', body, signal: AbortSignal.timeout(15000) });
  if (res.status !== 202 && res.status !== 204) throw new Error(`Hub respondió ${res.status}: ${await res.text()}`);
  return true;
}
