import type { MetadataRoute } from 'next';
import { getCategories, getSitemapEntries } from '@/lib/data';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ seeds, posts, videos }, categories] = await Promise.all([getSitemapEntries(), getCategories()]);
  const now = new Date();
  return [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/semillas'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/videos'), lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: absoluteUrl('/publicaciones'), lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    ...['/contacto', '/privacidad', '/terminos'].map((p) => ({ url: absoluteUrl(p), changeFrequency: 'yearly' as const, priority: 0.2 })),
    ...categories.map((c) => ({ url: absoluteUrl(`/${c.slug}`), lastModified: new Date(c.updated_at), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...seeds.map((s) => ({ url: absoluteUrl(`/semillas/${s.slug}`), lastModified: new Date(s.updated_at), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/${p.category?.slug}/${p.slug}`), lastModified: new Date(p.updated_at), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...videos.map((v) => ({ url: absoluteUrl(`/videos/${v.youtube_id}`), lastModified: new Date(v.updated_at), changeFrequency: 'yearly' as const, priority: 0.4 })),
  ];
}
