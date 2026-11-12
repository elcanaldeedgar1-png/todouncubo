import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import Pagination from '@/components/Pagination';
import AdSlot from '@/components/AdSlot';
import { EmptyState, PostCard, SectionHeader, VideoCard } from '@/components/Cards';
import { getCategory, getPosts, getVideos } from '@/lib/data';


type Params = Promise<{ categoria: string }>;
type SP = Promise<Record<string, string | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categoria } = await params;
  const cat = await getCategory(categoria);
  if (!cat) return { title: 'No encontrado', robots: { index: false } };
  return {
    title: `${cat.name} de Minecraft`,
    description: cat.description ?? `${cat.name} de Minecraft en Todo un Cubo.`,
    alternates: { canonical: `/${cat.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { categoria } = await params;
  const sp = await searchParams;
  const cat = await getCategory(categoria);
  if (!cat) notFound();

  const page = Number(sp.pagina) || 1;
  const [posts, videos] = await Promise.all([
    getPosts({ categorySlug: cat.slug, limit: 12, page }),
    page === 1 ? getVideos({ categorySlug: cat.slug, limit: 4 }) : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHero eyebrow="Categoría" title={cat.name} description={cat.description} accent={cat.accent} crumbs={[{ href: `/${cat.slug}`, label: cat.name }]} />
      <div className="container-cubo space-y-14 py-10">
        <section>
          {posts.items.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.items.map((p, i) => <PostCard key={p.id} post={p} priority={i < 3} />)}
            </div>
          ) : (
            <EmptyState title="Pronto habrá contenido aquí" text="Las publicaciones de esta categoría aparecerán automáticamente." />
          )}
          <Pagination page={posts.page} total={posts.total} pageSize={posts.pageSize} basePath={`/${cat.slug}`} />
        </section>

        {videos && videos.items.length > 0 && (
          <section>
            <SectionHeader eyebrow="YouTube" title={`Videos de ${cat.name}`} href={`/videos?categoria=${cat.slug}`} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {videos.items.map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          </section>
        )}
        <AdSlot />
      </div>
    </>
  );
}
