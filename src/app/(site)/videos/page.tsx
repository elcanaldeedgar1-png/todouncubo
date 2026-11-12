import type { Metadata } from 'next';
import Link from 'next/link';
import { FaYoutube } from 'react-icons/fa6';
import PageHero from '@/components/PageHero';
import Pagination from '@/components/Pagination';
import { EmptyState, VideoCard } from '@/components/Cards';
import { getCategories, getVideos } from '@/lib/data';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Videos de Minecraft',
  description: 'Todos los videos del canal de TrexxCraft: semillas, mods, shaders, tutoriales y curiosidades de Minecraft.',
  alternates: { canonical: '/videos' },
};

type SP = Promise<Record<string, string | undefined>>;

export default async function VideosPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const categoria = sp.categoria;
  const page = Number(sp.pagina) || 1;
  const [videos, categories] = await Promise.all([getVideos({ limit: 16, page, categorySlug: categoria }), getCategories()]);

  return (
    <>
      <PageHero
        eyebrow="YouTube"
        title="Videos"
        description="Se actualizan solos: cada video nuevo del canal aparece aquí automáticamente."
        crumbs={[{ href: '/videos', label: 'Videos' }]}
      >
        <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="btn-gold">
          <FaYoutube className="h-4 w-4" /> Suscribirme al canal
        </a>
      </PageHero>
      <div className="container-cubo py-10">
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href="/videos" className={cn('chip !py-1.5', !categoria && 'chip-active')}>Todos</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/videos?categoria=${c.slug}`} className={cn('chip !py-1.5', categoria === c.slug && 'chip-active')}>{c.name}</Link>
          ))}
        </div>
        {videos.items.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {videos.items.map((v, i) => <VideoCard key={v.id} video={v} priority={i < 4} />)}
          </div>
        ) : (
          <EmptyState title="No hay videos en esta sección" />
        )}
        <Pagination page={videos.page} total={videos.total} pageSize={videos.pageSize} basePath="/videos" params={{ categoria }} />
      </div>
    </>
  );
}
