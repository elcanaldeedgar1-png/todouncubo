import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaYoutube } from 'react-icons/fa6';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import JsonLd from '@/components/JsonLd';
import AdSlot from '@/components/AdSlot';
import { SeedCard, VideoCard } from '@/components/Cards';
import { getSeedsForVideo, getVideoByYoutubeId, getVideos } from '@/lib/data';
import { absoluteUrl } from '@/lib/site';
import { formatDate, truncate } from '@/lib/utils';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const v = await getVideoByYoutubeId(id);
  if (!v) return { title: 'Video no encontrado', robots: { index: false } };
  return {
    title: v.title,
    description: truncate(v.description || v.title, 158),
    alternates: { canonical: `/videos/${v.youtube_id}` },
    openGraph: { type: 'video.other', title: v.title, images: v.thumbnail_url ? [{ url: v.thumbnail_url }] : undefined, url: absoluteUrl(`/videos/${v.youtube_id}`) },
  };
}

export default async function VideoPage({ params }: { params: Params }) {
  const { id } = await params;
  const video = await getVideoByYoutubeId(id);
  if (!video || video.status !== 'published') notFound();

  const [seeds, more] = await Promise.all([
    getSeedsForVideo(video.id),
    getVideos({ limit: 5, categorySlug: video.category?.slug }),
  ]);

  return (
    <article className="container-cubo py-10">
      <nav aria-label="Migas de pan" className="mb-6 text-xs text-bone-dim">
        <Link href="/" className="hover:text-gold-200">Inicio</Link> / <Link href="/videos" className="hover:text-gold-200">Videos</Link>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <YouTubeEmbed id={video.youtube_id} title={video.title} />
          <h1 className="mt-6 text-2xl font-bold leading-snug text-bone sm:text-3xl">{video.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-bone-muted">
            <time dateTime={video.published_at}>{formatDate(video.published_at)}</time>
            {video.category && <Link href={`/${video.category.slug}`} className="chip hover:text-gold-200">{video.category.name}</Link>}
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn-stone !py-1.5 !text-xs">
              <FaYoutube className="h-4 w-4 text-[#ff3b30]" /> Ver en YouTube
            </a>
          </div>

          {seeds.length > 0 && (
            <section className="mt-10">
              <h2 className="pixel-title mb-4 text-xl sm:text-2xl text-gold-200">Semillas de este video</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {seeds.map((s) => <SeedCard key={s.id} seed={s} />)}
              </div>
            </section>
          )}

          {video.description && (
            <section className="block-panel mt-10 p-6">
              <h2 className="label">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-bone/85">{video.description}</p>
            </section>
          )}
          <AdSlot className="mt-10" />
        </div>
        <aside className="space-y-4">
          <h2 className="label">Más videos</h2>
          {more.items.filter((v) => v.id !== video.id).slice(0, 4).map((v) => <VideoCard key={v.id} video={v} />)}
        </aside>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: video.title,
          description: truncate(video.description || video.title, 300),
          thumbnailUrl: video.thumbnail_url ?? undefined,
          uploadDate: video.published_at,
          embedUrl: `https://www.youtube.com/embed/${video.youtube_id}`,
          contentUrl: video.url,
        }}
      />
    </article>
  );
}
